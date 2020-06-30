import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { UserSessionEntity } from "./session.entity";
import { User } from '../types/user';

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    login: string;

    @Column()
    password: string;

    @Column({default: () => "CURRENT_TIMESTAMP"})
    dateCreation?: Date

    @OneToMany(type => UserSessionEntity, session => session.user)
    sessions?: UserSessionEntity[];

    public ToRequestObject(): User {
        return {
            id: this.id,
            login: this.login,
            password: this.password,
            session: ""
        };
    };

}