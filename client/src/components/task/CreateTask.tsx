import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Radio,
  Select,
  DatePicker,
  ConfigProvider,
  Modal,
  Result,
  Switch,
} from "antd";
import { Store } from "antd/lib/form/interface";
import FormLocale from "antd/es/locale/uk_UA";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";
import * as moment from "moment";
import "moment/locale/uk";
import { Task, TaskPriority, TaskPeriod, TaskStatus } from "../../types/task";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
  ResponseMessage,
  ResponseCode,
  RequestType,
} from "../../types/requests";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { User, UserRole } from "../../types/user";
import {
  formatDateForStartDate,
  formatDateForEndDate,
} from "../../helpers/taskHelper";
import { UserPosition } from "../../types/userPosition";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

moment.locale("uk");

interface ModalProps {
  visible: boolean;
  title: string;
  content: string;
}

interface Props {}
export const CreateTask: React.FC<Props> = () => {
  //////HOOKS
  const accState = useSelector(selectAccount);
  const [modalState, setModalState] = useState<ModalProps>({
    visible: false,
    title: "",
    content: "",
  });
  const [subordinatesState, setSubordinatesState] = useState<User[]>([
    accState,
  ]);
  const [
    privateTaskSwitchEnabled,
    setPrivateTaskSwitchEnabled,
  ] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    ConnectionManager.getInstance().registerResponseOnceHandler(
      RequestType.GET_MY_SUBORDINATE,
      (data) => {
        const dataMessage = data as ResponseMessage<Array<User>>;
        if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
          console.log(`Error: ${dataMessage.requestCode}`);
          return;
        }
        console.log(RequestType.GET_MY_SUBORDINATE, data);
        setSubordinatesState(
          dataMessage.data.filter((u) => u.role !== UserRole.ADMIN)
        );
      }
    );

    ConnectionManager.getInstance().emit(
      RequestType.GET_MY_SUBORDINATE,
      {},
      accState.session
    );
  }, []);
  //////VARIABLES
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const usersGroupExecuters: Map<UserPosition, Array<User>> = new Map<
    UserPosition,
    Array<User>
  >();

  subordinatesState.forEach((u) => {
    const isContain =
      Array.from(usersGroupExecuters).findIndex(
        (value) => value[0].pos_id === u.position.pos_id
      ) >= 0;

    if (isContain) {
      usersGroupExecuters.forEach((value, key) => {
        if (key.pos_id === u.position.pos_id) {
          value.push(u);
        }
      });
    } else {
      usersGroupExecuters.set(u.position, [u]);
    }
  });

  if (
    Array.from(usersGroupExecuters).findIndex(
      (value) => value[0].pos_id === accState.position.pos_id
    ) < 0
  ) {
    usersGroupExecuters.set(accState.position, [accState]);
  } else {
    usersGroupExecuters.forEach((value, key) => {
      if (key.pos_id === accState.position.pos_id) {
        if (value.findIndex((u) => u.id === accState.id) < 0) {
          value.push(accState);
        }
      }
    });
  }

  const taskPriorities = [
    { value: TaskPriority.USUAL, name: "Звичайний" },
    { value: TaskPriority.YELLOW, name: "Важливий" },
    { value: TaskPriority.RED, name: "Терміновий" },
  ];
  const taskPeriod = [
    { value: TaskPeriod.ONCE, name: "Одноразова задача" },
    { value: TaskPeriod.MONTH, name: "Щомісяца" },
    { value: TaskPeriod.HALFYEAR, name: "Кожні півроку" },
    { value: TaskPeriod.YEAR, name: "Щорічна задача" },
  ];

  //////CALLBACKS
  const onFinish = (data: Store) => {
    console.log(data);
    ConnectionManager.getInstance().registerResponseOnceHandler(
      RequestType.CREATE_TASK,
      (data) => {
        console.log(data);
        const dataMessage = data as ResponseMessage<Task>;
        if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
          console.log(`Error: ${dataMessage.requestCode}`);
          return;
        }

        setModalState({
          visible: true,
          title: "Система",
          content: "Задача була успішно створена",
        });
        form.resetFields();
        setPrivateTaskSwitchEnabled(false);
      }
    );
    const task: Task = {
      id: 0,
      authorId: accState.id,
      description: data.taskDescription,
      title: data.taskName,
      executerId: data.taskExecutor,
      period: data.period,
      priority: data.priority,
      startDate: formatDateForStartDate(data.taskDuration[0].toDate()),
      endDate: formatDateForEndDate(data.taskDuration[1].toDate()),
      status: TaskStatus.IN_PROGRESS,
      dateComplited: new Date(),
      periodParentId: 0,
      report: { id: 0, content: "", dateCreation: new Date() },
      isPrivate: privateTaskSwitchEnabled ? data.private : false,
    };

    ConnectionManager.getInstance().emit(
      RequestType.CREATE_TASK,
      task,
      accState.session
    );
  };

  const handleModalOk = () => {
    setModalState({ visible: false, content: "", title: "" });
  };

  const handleExecutorSelect = (u_id: number) => {
    if (accState.id === u_id) {
      setPrivateTaskSwitchEnabled(true);
    } else {
      setPrivateTaskSwitchEnabled(false);
    }
  };

  return (
    <div
      style={{
        paddingTop: "2%",
        width: "100%",
        maxWidth: "1000px",
        margin: 0,
        textAlign: "center",
        display: "inline-block",
      }}
    >
      <ConfigProvider locale={FormLocale}>
        <Form
          {...layout}
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          initialValues={{ size: "middle" }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Назва задачі"
            name="taskName"
            rules={[
              {
                required: true,
                message: "Будь-ласка, введіть назву задачі!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Опис задачі"
            name="taskDescription"
            rules={[
              { required: true, message: "Будь-ласка, введіть опис задачі!" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Виконавець"
            name="taskExecutor"
            rules={[
              { required: true, message: "Будь-ласка, оберіть виконавця!" },
            ]}
          >
            <Select onChange={handleExecutorSelect}>
              {Array.from(usersGroupExecuters).map(
                (value: [UserPosition, User[]]) => {
                  return (
                    <Select.OptGroup label={value[0].name}>
                      {value[1].map((v) => {
                        if (v.id === accState.id) {
                          return <Select.Option value={v.id}>Я</Select.Option>;
                        }

                        return (
                          <Select.Option value={v.id}>
                            {User.GetUserPIB(v)}
                          </Select.Option>
                        );
                      })}
                    </Select.OptGroup>
                  );
                }
              )}
            </Select>
          </Form.Item>
          <Form.Item
            label="Термін виконання"
            name="taskDuration"
            rules={[
              {
                required: true,
                message: "Будь-ласка, оберіть термін виконання!",
              },
            ]}
          >
            <RangePicker
              picker="date"
              locale={DatePickerLocal}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "50%",
              }}
            />
          </Form.Item>

          <Form.Item
            label="Періодичність"
            name="period"
            rules={[
              {
                required: true,
                message: "Будь-ласка, оберіть періодичність!",
              },
            ]}
          >
            <Radio.Group
              buttonStyle="solid"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "auto",
              }}
            >
              {taskPeriod.map((period) => {
                return (
                  <Radio.Button value={period.value}>
                    {period.name}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Пріоритетність"
            name="priority"
            rules={[
              {
                required: true,
                message: "Будь-ласка, оберіть пріоритет виконання!",
              },
            ]}
          >
            <Radio.Group
              buttonStyle="solid"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "auto",
              }}
            >
              {taskPriorities.map((tp) => {
                return <Radio.Button value={tp.value}>{tp.name}</Radio.Button>;
              })}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            style={{
              visibility: privateTaskSwitchEnabled ? "visible" : "hidden",
            }}
            label="Особисте завдання"
            name="private"
          >
            <Switch
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "auto",
              }}
              disabled={!privateTaskSwitchEnabled}
            />
          </Form.Item>
          <Form.Item
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "auto",
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "auto",
              }}
            >
              СТВОРИТИ
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title={modalState.title}
          visible={modalState.visible}
          onOk={handleModalOk}
          footer={[
            <Button key="submit" type="primary" onClick={handleModalOk}>
              OK
            </Button>,
          ]}
        >
          <Result status="success" title={modalState.content} />
        </Modal>
      </ConfigProvider>
    </div>
  );
};
