import {
	Entity,
	Column,
	OneToOne,
	JoinColumn,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { UserPosition } from "../types/userPosition";
import { UserEntity } from "./user.entity";

@Entity()
export class UserPositionEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	pos_id: number;

	@Column()
	name: string;

	@ManyToOne((type) => UserPositionEntity)
	@JoinColumn()
	parent: UserPositionEntity;

	@OneToMany((type) => UserEntity, (photo) => photo.position)
	users: UserEntity[];

	public ToRequestObject(): UserPosition {
		return {
			pos_id: this.pos_id,
			name: this.name,
			parent_id: this.parent.id,
		};
	}
}
