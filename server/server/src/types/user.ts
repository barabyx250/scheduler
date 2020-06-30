
export class User {
    id: number;
    session: string;
    login: string;
    password: string;

    public static EmptyUser(): User {
        return {
            id: 0,
            session: "",
            login: "",
            password: ""
        };
    }
}



