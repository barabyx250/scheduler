import React, { useState, useEffect } from "react";
import {
  Drawer,
  Typography,
  Button,
  Modal,
  Input,
  Progress,
  Descriptions,
  Row,
} from "antd";
import { User } from "../../types/user";
import { Task, TaskStatus, TaskReport } from "../../types/task";
import { CheckOutlined } from "@ant-design/icons";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
  RequestType,
  ResponseMessage,
  ResponseCode,
} from "../../types/requests";
import Store from "../../app/store";
import moment from "moment";
import { Test } from "./test";
import modal from "antd/lib/modal";
import { ok } from "assert";
import TextArea from "antd/lib/input/TextArea";
import { TaskReportModal } from "./TaskReportModal";

const { Text, Paragraph } = Typography;

export interface TaskDrawerProps {
  visible: boolean;
  task?: Task;
  executer?: User;
  author?: User;
  onClose: () => void;
}

export class TaskDrawer extends React.Component<
  TaskDrawerProps,
  {
    showModalReportError: boolean;
  }
> {
  componentWillMount() {
    this.setState({ showModalReportError: false });
  }

  formatDate(date: Date | undefined) {
    if (date !== undefined) {
      let newDate = new Date(date);
      return newDate.toLocaleDateString();
    }

    return "";
  }

  onTaskFinish() {
    ConnectionManager.getInstance().registerResponseOnceHandler(
      RequestType.FINISH_TASK,
      (data) => {
        console.log(data);
        const dataMessage = data as ResponseMessage<Task>;
        if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
          console.log(`Error: ${dataMessage.requestCode}`);
          return;
        }
      }
    );

    const report: TaskReport = {
      id: 0,
      content: "",
      dateCreation: new Date(),
    };

    if (this.props.task) {
      report.id = this.props.task?.report.id;
    }

    const modal = Modal.confirm({
      title: "Звіт про завершення завдання",
      centered: true,
      okButtonProps: {
        style: {
          visibility: "hidden",
        },
      },
      cancelButtonProps: {
        style: {
          visibility: "hidden",
        },
      },
      content: (
        <div>
          <TaskReportModal
            startValue=""
            onOk={(_report) => {
              if (this.props.task !== undefined) {
                let reportTaskComplite: TaskReport = {
                  id: 0,
                  content: _report,
                  dateCreation: new Date(),
                };

                ConnectionManager.getInstance().emit(
                  RequestType.FINISH_TASK,
                  { id: this.props.task.id, report: reportTaskComplite },
                  Store.getState().account.session
                );

                modal.destroy();
              }
            }}
            onCancel={() => {
              modal.destroy();
            }}
          />
        </div>
      ),
    });
  }

  getTerminPercentOfTask() {
    if (this.props.task) {
      const end = moment(this.props.task.endDate).unix();
      const start = moment(this.props.task.startDate).unix();
      const currDate = moment().unix();
      const curr = currDate;
      //new Date().getTime();
      const duration = end - start;
      const currDuration = curr - start;

      if (duration < 0) {
        return 0;
      }

      const result = (currDuration * 100) / duration;

      return Math.round(result);
    }
    return 0;
  }

  getGradientProgressBar(): any {
    const percent = this.getTerminPercentOfTask();
    /**
 * {
									"0%": "#52c41a",
									"20%": "#a0d911",
									"40%": "#fadb14",
									"60%": "#faad14",
									"80%": "#fa541c",
									"100%": "#f5222d",
								}
 */
    if (percent < 20) {
      return { "0%": "#52c41a", "100%": "#52c41a" };
    } else if (percent < 40) {
      return { "0%": "#52c41a", "100%": "#a0d911" };
    } else if (percent < 60) {
      return { "0%": "#52c41a", "50%": "#a0d911", "100%": "#fadb14" };
    } else if (percent < 80) {
      return {
        "0%": "#52c41a",
        "30%": "#a0d911",
        "60%": "#fadb14",
        "100%": "#faad14",
      };
    } else if (percent <= 10000000) {
      return {
        "0%": "#52c41a",
        "20%": "#a0d911",
        "40%": "#fadb14",
        "60%": "#faad14",
        "80%": "#fa541c",
        "100%": "#f5222d",
      };
    }
  }

  render() {
    return (
      <Drawer
        title={this.props?.task?.title}
        placement="right"
        closable={false}
        visible={this.props?.visible}
        onClose={this.props.onClose}
        width="40%"
      >
        <div>
          {/* <Title level={2}>{this.props?.task?.title}</Title> */}
          {this.props.task?.isPrivate && (
            <Text>ПРИВАТНЕ ЗАВДАННЯ (БАЧИТЕ ТІЛЬКИ ВИ)</Text>
          )}
          <Descriptions title={this.props?.task?.title} bordered>
            <Descriptions.Item label="Опис" span={3}>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: "далі" }}
              >
                {this.props?.task?.description}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Поставив:" span={3}>
              {User.GetUserPIB(this.props?.author)}
            </Descriptions.Item>
            <Descriptions.Item label="Виконує:" span={3}>
              {User.GetUserPIB(this.props?.executer)}
            </Descriptions.Item>
            <Descriptions.Item label="Терміни:" span={3}>
              <Text>
                {this.formatDate(this.props.task?.startDate)} -{" "}
                {this.props.task !== undefined &&
                  this.formatDate(new Date(this.props.task?.endDate))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Проходження терміна:" span={3}>
              <Progress
                percent={this.getTerminPercentOfTask()}
                status="active"
                strokeColor={{ ...this.getGradientProgressBar() }}
              />
            </Descriptions.Item>
            {this.props.task?.status === TaskStatus.COMPLITED && (
              <Descriptions.Item label="Дата завершення:" span={3}>
                {this.formatDate(new Date(this.props.task?.dateComplited))}
              </Descriptions.Item>
            )}
          </Descriptions>
          <br></br>
          {Store.getState().account.id === this.props.executer?.id && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={this.onTaskFinish.bind(this)}
            >
              Звітувати про виконання
            </Button>
          )}
        </div>
      </Drawer>
    );
  }
}
