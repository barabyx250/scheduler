interface KeyValuePair {
	key: string;
	value: any;
}

export class TimersManager {
	private static instance: TimersManager;
	private timers: Array<KeyValuePair>;

	private constructor() {
		this.timers = [];
	}

	private addTimer(key: string, timer: NodeJS.Timeout) {
		this.timers.push({ key, value: timer });
	}

	public static getInstance(): TimersManager {
		if (!TimersManager.instance) {
			TimersManager.instance = new TimersManager();
		}

		return TimersManager.instance;
	}

	public subscribeCallback(key: string, time: number, cb: any) {
		const timer = setInterval(cb, time);
		this.addTimer(key, timer);
	}

	public clearAllCallback() {
		this.timers.forEach((item) => {
			clearInterval(item.value);
		});
		this.timers = [];
	}
}
