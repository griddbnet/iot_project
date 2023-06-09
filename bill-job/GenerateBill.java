import com.toshiba.mwcloud.gs.Collection;
import com.toshiba.mwcloud.gs.GSException;
import com.toshiba.mwcloud.gs.GridStore;
import com.toshiba.mwcloud.gs.GridStoreFactory;
import com.toshiba.mwcloud.gs.Query;
import com.toshiba.mwcloud.gs.RowKey;
import com.toshiba.mwcloud.gs.RowSet;
import com.toshiba.mwcloud.gs.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Date;
import java.util.Calendar;
import java.util.Properties;

public class GenerateBill {

    private GridStore store ;

    public GenerateBill () {
        try {
            Properties props = new Properties();
            props.setProperty("notificationMember", "griddb-server:10001");
            props.setProperty("clusterName", "myCluster");
            props.setProperty("user", "admin"); 
            props.setProperty("password", "admin");
            store = GridStoreFactory.getInstance().getGridStore(props);
        } catch (Exception e) {
            System.out.println("Could not get Gridstore instance, exitting.");
            System.exit(-1);
        }
    }

    int getDate(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int absdate = cal.get(Calendar.YEAR)*1000+cal.get(Calendar.DAY_OF_YEAR);
        return absdate;
    }


    static Date fromYMD(int year, int month, int day) {
        Calendar cal = Calendar.getInstance();
        cal.set(year, month, day, 0, 0, 0);
        return cal.getTime();
    }

    static Date floorDate(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();


    }
    static Date monthFrom(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.MONTH, 1);
        return cal.getTime();


    }

    public void writeBill(Integer meterId, Date start, Date end, double total_kwh, HashMap<Integer,Double> daily_kwh_map) throws GSException {

        BillRecord b = new BillRecord();

        b.billing_date = end;
        b.total_kwh = total_kwh;
        b.amount = "$"+total_kwh*0.125;

        String daily_kwh = "[";
       
        boolean first=true ;
        for(Double d : daily_kwh_map.values())  {
            if(!first)
                daily_kwh += ",";
            daily_kwh += d;
            first=false;

        }
        daily_kwh += "]";

        b.daily_kwh = daily_kwh; 

        System.out.println("Bill="+b);

        Collection<Date, BillRecord> billTs = store.putCollection("bill_"+meterId, BillRecord.class);
        billTs.setAutoCommit(false);
        billTs.put(b);
        billTs.commit();

    }

    public void genBill(Integer meterId, Date start ) throws GSException {
       
        HashMap<Integer, Double> daily_kwh_map = new HashMap();
        double total_kwh = 0;

        Date end = monthFrom(start); 
        Collection<Date, MeterRecord> meterTs = store.getCollection("meter_"+meterId, MeterRecord.class);
        Query<MeterRecord> q = meterTs.query("select * where timestamp >= TO_TIMESTAMP_MS("+start.getTime()+") and timestamp <= TO_TIMESTAMP_MS("+end.getTime()+")");

        RowSet<MeterRecord> rs = q.fetch(false);

        while (rs.hasNext()) {
            MeterRecord data = rs.next();
            int day = getDate(data.timestamp)-getDate(start);
            if(daily_kwh_map.get(day) == null)
                daily_kwh_map.put(day, data.kwh);
            else
                daily_kwh_map.put(day, daily_kwh_map.get(day)+data.kwh);

            total_kwh += data.kwh;
        }


        writeBill(meterId, start, end, total_kwh, daily_kwh_map);
//        System.out.println("daily_kwh_map:"+daily_kwh_map);
//        System.out.println("start:"+start+" total_kwh:"+total_kwh);
    }

    public Date firstBillDate(Integer meterId, Integer bill_date) throws GSException {
        System.out.println("meter_"+meterId);
        Collection<Date, MeterRecord> meterTs = store.getCollection("meter_"+meterId, MeterRecord.class);
        Query<MeterRecord> q = meterTs.query("select * order by timestamp asc");

        RowSet<MeterRecord> rs = q.fetch(false);
        if (rs.hasNext()) {
            MeterRecord data = rs.next();
            Calendar firstMetering = Calendar.getInstance();
            Calendar billStart = Calendar.getInstance();
            firstMetering.setTime(data.timestamp);
            billStart.setTime(data.timestamp);
            billStart.set(Calendar.DATE, bill_date);
            if(billStart.compareTo(firstMetering) < 0) {
                billStart.add(Calendar.MONTH, 1);
            }
           
            return billStart.getTime(); 
             
        }

        return null;
        
 
    }

    public void genBills(Date today) throws GSException {


        Calendar cal = Calendar.getInstance();
        cal.setTime(today);
        int date = cal.get(Calendar.DAY_OF_MONTH);

        System.out.println("Generating bills for "+today+" billingdate="+date);
        Collection<String, MeterInfoRecord> meterInfo  = store.getCollection("meters", MeterInfoRecord.class);
        Query<MeterInfoRecord> q = meterInfo.query("select * where billdate = "+date);

        RowSet<MeterInfoRecord> rs = q.fetch(false);
 
        while (rs.hasNext()) {
            Calendar billDate = Calendar.getInstance();
            billDate.setTime(today);
            billDate.add(Calendar.MONTH, -1); 
            MeterInfoRecord data = rs.next();
            System.out.println("Gen bill for meter_"+data.meterId+" for "+billDate.getTime());
            genBill(data.meterId, billDate.getTime());
            
        }
    }

    public void genOldBills() throws GSException {

        Collection<String, MeterInfoRecord> meterInfo  = store.getCollection("meters", MeterInfoRecord.class);
        Query<MeterInfoRecord> q = meterInfo.query("select *");

        RowSet<MeterInfoRecord> rs = q.fetch(false);

        while (rs.hasNext()) {
            MeterInfoRecord data = rs.next();

            Calendar lastBillDate = Calendar.getInstance();
            Date today = floorDate(new Date());
            lastBillDate.setTime(today);
            lastBillDate.set(Calendar.DATE, data.billdate);
            if (lastBillDate.getTime().compareTo(today) > 0) {
                lastBillDate.add(Calendar.MONTH, -1);
            }
            lastBillDate.add(Calendar.MONTH, -1);

            Date billDate = floorDate(firstBillDate(data.meterId, data.billdate));
            System.out.print(data.meterId+": "+billDate+"/"+lastBillDate.getTime());
            
            while(billDate.compareTo(lastBillDate.getTime()) <= 0) {
                System.out.println("Gen bill for meter_"+data.meterId+" for "+billDate);
                genBill(data.meterId, billDate);
                billDate = monthFrom(billDate);
            }
        }

    }

    public static void main (String args[]) throws GSException {
//        System.out.println(fromYMD(2022,11,12) +" to "+ monthFrom(fromYMD(2022,12,12)));
//
        GenerateBill gb = new GenerateBill();
        if(args.length >= 1) {
            gb.genBills(floorDate(new Date(Long.parseLong(args[0])*1000)));
        } else {
            System.out.println("gen old bills");
            gb.genOldBills();
        }

    }
}
