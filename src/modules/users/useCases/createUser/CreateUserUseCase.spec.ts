import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";


let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {


  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user = {
      name: "test",
      email: "test@test.com",
      password: "123"
    }

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    const result = await usersRepositoryInMemory.findByEmail(user.email);

    expect(result).toHaveProperty("id");
  });

  it("should not be able to create a new user with email that already exists", async () => {
    expect(async () => {
      const user = {
        name: "test 2",
        email: "test@test.com",
        password: "123"
      }

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });

    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
