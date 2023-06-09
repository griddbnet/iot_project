import com.toshiba.mwcloud.gs.RowKey;
class MeterInfoRecord {

    @RowKey Integer meterId;
    Integer billdate;

    public String toString() {
        return meterId+": "+billdate;
    }
}
