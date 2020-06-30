export class User {
  constructor(id: number, session: string, login: string, password: string) {
    this.id = id;
    this.session = session;
    this.login = login;
    this.password = password;
  }

  id: number;
  session: string;
  login: string;
  password: string;

  public static EmptyUser(): User {
    return {
      id: 0,
      session: "",
      login: "",
      password: "",
    };
  }
}
