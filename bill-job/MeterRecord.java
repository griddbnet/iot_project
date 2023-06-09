import java.util.Date;
import com.toshiba.mwcloud.gs.RowKey;

class MeterRecord {

    @RowKey Date timestamp;
    double kwh;
    double temp;

    public String toString() {
        return timestamp+": "+kwh +"kwh, "+temp+"C";
    }
}
