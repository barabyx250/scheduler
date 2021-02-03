import { Empty, Typography, Input } from "antd";
import React, { useState, useEffect } from "react";
import { Task, TaskStatus } from "../../../types/task";
import { User } from "../../../types/user";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
  RequestType,
  ResponseMessage,
  ResponseCode,
} from "../../../types/requests";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { TableTask } from "../task-table/TableTask";
import { TaskFilters } from "../../../types/taskFilter";

const { Title } = Typography;
const { Search } = Input;

export const AssignedTasks: React.FC = () => {
  const accState = useSelector(selectAccount);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const getAssignedByMeTasks = (value: string = "") => {
    ConnectionManager.getInstance().registerResponseOnceHandler(
      RequestType.GET_USERS_INFO,
      (data) => {
        const dataMessage = data as ResponseMessage<Array<User>>;
        if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
          console.log(`Error: ${dataMessage.requestCode}`);
          return;
        }
        console.log("GOT USERS", dataMessage);

        setUsers(dataMessage.data);
      }
    );

    ConnectionManager.getInstance().registerResponseOnceHandler(
      RequestType.SELECT_MY_TASKS_BY_FILTER,
      (data) => {
        const dataMessage = data as ResponseMessage<Array<Task>>;
        console.log("GOT TASKS", dataMessage);

        if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
          console.log(`Error: ${dataMessage.requestCode}`);
          return;
        }
        setTasks(dataMessage.data);

        const userId: number[] = [];
        dataMessage.data.forEach((element) => {
          userId.push(element.executerId);
          userId.push(element.authorId);
        });

        ConnectionManager.getInstance().emit(
          RequestType.GET_USERS_INFO,
          userId.filter(function (elem, pos, arr) {
            return arr.indexOf(elem) === pos;
          }),
          accState.session
        );
      }
    );

    ConnectionManager.getInstance().emit(
      RequestType.SELECT_MY_TASKS_BY_FILTER,
      {
        authorIds: [accState.id],
        status: TaskStatus.IN_PROGRESS,
        nameReg: ".*" + value + ".*",
        getOriginalTask: true,
      } as TaskFilters,
      accState.session
    );
  };
  useEffect(getAssignedByMeTasks, []);

  const onSearch = (value: string) => {
    getAssignedByMeTasks(value);
  };

  console.log("Send to draw tasks", tasks, "users: ", users);

  return (
    <div>
      <Title level={2}>
        Завершені задачі які поставили Вам і які поставили Ви
      </Title>
      <Search
        placeholder="Введіть назву завдання для пошуку"
        onSearch={onSearch}
        enterButton
      />
      {tasks.length === 0 || users.length === 0 ? (
        <Empty></Empty>
      ) : (
        <TableTask tasks={tasks} users={users}></TableTask>
      )}
    </div>
  );
};
