import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { UserEntity } from './user.entity';

@Entity()
export class UserSessionEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    session: string;

    @Column({default: () => "CURRENT_TIMESTAMP"})
    dateCreation: Date

    @ManyToOne(type => UserEntity, user => user.sessions)
    user: UserEntity;
}