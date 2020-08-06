export class UserPosition {
	pos_id: number;
	name: string;
	parent_id: number;
}

export interface PositionTreeData {
	title: string;
	value: string;
	children?: Array<PositionTreeData>;
}

export class TreeUserPosition {
	public positions: Map<number, UserPosition[]>;
	public arrPositions: UserPosition[];

	public fillByArray(poss: UserPosition[]) {
		this.arrPositions = new Array(...poss);
		this.positions = new Map<number, UserPosition[]>();
		poss.forEach((pos) => {
			if (this.positions.has(pos.parent_id)) {
				this.positions.get(pos.parent_id)?.push(pos);
			} else {
				const childs = Array<UserPosition>();
				childs.push(pos);
				this.positions.set(pos.parent_id, childs);
			}
		});
	}

	public findPossById(p_id: number): UserPosition {
		const res = this.arrPositions.find((item) => {
			return item.pos_id === p_id;
		});
		if (res) return res;

		return {
			name: "",
			parent_id: 0,
			pos_id: 0,
		};
	}

	public generateTreeData(parent_id: number = 0): PositionTreeData[] {
		const resPositions: PositionTreeData[] = [];
		const pos = this.findPossById(parent_id);
		const childs: PositionTreeData[] = [];

		this.positions.get(parent_id)?.forEach((i) => {
			debugger;
			if (i.pos_id !== pos.pos_id) {
				const childChilds = this.generateChildsTreeData(i.pos_id);
				childs.push({
					title: i.name,
					value: i.pos_id.toString(),
					children: childChilds,
				});
			}
		});

		if (pos.name !== "")
			resPositions.push({
				title: pos.name,
				value: pos.pos_id.toString(),
				children: childs.length === 0 ? undefined : childs,
			});
		return resPositions;
	}

	private generateChildsTreeData(parent_id: number) {
		const resPositions: PositionTreeData[] = [];
		const pos = this.findPossById(parent_id);

		this.positions.get(parent_id)?.forEach((i) => {
			if (i.pos_id !== pos.pos_id) {
				const childChilds = this.generateChildsTreeData(i.pos_id);
				resPositions.push({
					title: i.name,
					value: i.pos_id.toString(),
					children: childChilds,
				});
			}
		});
		return resPositions;
	}
}
