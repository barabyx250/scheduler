import { Moment } from "moment";
import moment from "moment";

export class AlarmManager {
	private static calcInterval(start: Moment, end: Moment) {
		return end.valueOf() - start.valueOf();
	}

	public static newAlarm(date: Moment, callBack: () => void) {
		const nowMoment = moment();
		const intervalMssec = AlarmManager.calcInterval(nowMoment, date);
		if (intervalMssec > 0) {
			setTimeout(callBack, intervalMssec);
		}
	}
}
