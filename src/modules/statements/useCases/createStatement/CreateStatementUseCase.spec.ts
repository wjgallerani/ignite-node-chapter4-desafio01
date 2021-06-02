import { Statement } from './../../entities/Statement';
import { OperationType } from "./../../entities/Statement";

import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';

import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';

import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from './CreateStatementError';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';


let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Create Statement", () => {

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to make deposit", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      password: "123",
      name: "Test",
    };

    const createUser = await createUserUseCase.execute(user);

    expect(createUser).toHaveProperty("id");

    const user_id = createUser.id as string;

    const deposit: ICreateStatementDTO = {
      user_id,
      type: "Test" as OperationType,
      amount: 100,
      description: "test",
    }

    const resultDeposit = await createStatementUseCase.execute(deposit);

    expect(resultDeposit).toHaveProperty("id");
    expect(resultDeposit.user_id).toEqual(user_id);
    expect(resultDeposit.amount).toEqual(deposit.amount);
    expect(resultDeposit.type).toEqual(deposit.type);
  })

  it("should be able to make withdraw", async () => {
    const user: ICreateUserDTO = {
      email: "test@teste.com",
      password: "123",
      name: "Test",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
    
    const user_id = userCreated.id as string;

    const deposit: ICreateStatementDTO = {
      user_id,
      type: "Test" as OperationType,
      amount: 150,
      description: "test",
    };

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id,
      type: "Test" as OperationType,
      amount: 150,
      description: "test",
    }

    const resultWithdraw = await createStatementUseCase.execute(withdraw);

    expect(resultWithdraw).toBeInstanceOf(Statement);
    expect(resultWithdraw).toHaveProperty("id");
    expect(resultWithdraw.user_id).toEqual(user_id);
    expect(resultWithdraw.type).toEqual("Test");
    expect(resultWithdraw.amount).toEqual(150);
  });

  it("should not be able to deposit/withdraw with non-existing user", async () => {
    expect(async () => {
      //const user_id = "Non-existing-user";
      const deposit: ICreateStatementDTO = {
        user_id: "Non-existing-user",
        type: "Test" as OperationType,
        amount: 50,
        description: "test",
      }

      await createStatementUseCase.execute(deposit);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw without money", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "test@test.com",
        password: "123",
        name: "Test 1",
      };

      const userCreated = await createUserUseCase.execute(user);

      expect(userCreated).toHaveProperty("id");

      const user_id = userCreated.id as string;

      const withdraw: ICreateStatementDTO = {
        user_id,
        type: "Test" as OperationType,
        amount: 200,
        description: "test",
      }

      await createStatementUseCase.execute(withdraw);

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
