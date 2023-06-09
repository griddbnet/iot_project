import com.toshiba.mwcloud.gs.RowKey;
import java.util.Date;
class BillRecord {

    @RowKey Date billing_date;
    double total_kwh;
    String amount;
    String daily_kwh;

    public String toString() {
        String retval=billing_date+": "+total_kwh+"="+amount;
        return retval; 
    }
}
