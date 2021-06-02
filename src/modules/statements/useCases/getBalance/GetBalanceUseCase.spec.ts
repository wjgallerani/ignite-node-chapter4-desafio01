import { OperationType } from './../../entities/Statement';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { GetBalanceError } from './GetBalanceError';

import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';

import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';

let getBalanceUseCase: GetBalanceUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to get balance", async () => {
    const user: ICreateUserDTO = {
      email: "test@teste.com",
      password: "123",
      name: "Test",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
    const user_id = userCreated.id as string;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 10,
      description: "test",
    });

    const balanceTest = await getBalanceUseCase.execute({ user_id });

    expect(balanceTest.statement[0]).toHaveProperty("id")
    expect(balanceTest.statement.length).toBe(1);
    expect(balanceTest.balance).toEqual(10);
  });

  it("should not be able to get balance from non-existing user", async () => {
    expect(async () => {
      const user_id = "idTest"
      await getBalanceUseCase.execute({ user_id });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
