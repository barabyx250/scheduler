import React from "react";
import { Task, TaskPriority, TaskStatus } from "../../../types/task";
import { Typography, Empty, Col, Row, Button } from "antd";
import Timeline, {
  TimelineHeaders,
  DateHeader,
  SidebarHeader,
} from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
  RequestType,
  ResponseMessage,
  ResponseCode,
} from "../../../types/requests";
import Store from "../../../app/store";
import { User } from "../../../types/user";
import { TaskDrawer, TaskDrawerProps } from "../../task/TaskDrawer";
import {
  formatDateTaskForDisplay,
  ifTaskBetweenDates,
} from "../../../helpers/taskHelper";
import { setGetTaskDateInterval } from "../../../redux/slicers/taskSlice";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { addMonths, addWeeks } from "date-fns";
import { endOfMonth, startOfMonth } from "date-fns/esm";

const { Text } = Typography;

interface TimeLineItem {
  id: number;
  group: number;
  title: string;
  start_time: Date;
  end_time: Date;
  canMove: boolean;
  canResize: boolean;
  canChangeGroup: boolean;
  data: any;
  itemProps?: any;
}

export class CalendarViewMonth extends React.Component<
  {
    tasks: Array<Task>;
  },
  {
    taskDrawer: TaskDrawerProps;
    start: Date;
    end: Date;
  }
> {
  constructor(props: any) {
    super(props);

    this.setState({
      taskDrawer: {
        visible: false,
        onClose: this.onItemDrawerClose.bind(this),
      },
    });

    const [start, end] = this.getStartEndOfMonth();

    Store.dispatch(setGetTaskDateInterval({ from: start, to: end }));
  }
  getStartEndOfMonth(): Date[] {
    var date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 1);

    return [firstDay, lastDay];
  }
  ifTaskInDate(date: Date, task: Task): boolean {
    const one = date <= task.endDate;
    const two = date >= task.startDate;
    const result: boolean = one && two;
    return result;
  }

  onItemClicked(item: TimeLineItem) {
    const taskData = item.data as Task;

    ConnectionManager.getInstance().registerResponseOnceHandler(
      RequestType.GET_USERS_INFO,
      (data) => {
        const dataMessage = data as ResponseMessage<Array<User>>;
        if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
          console.log(`Error: ${dataMessage.requestCode}`);
          return;
        }

        let executer = dataMessage.data[0];
        let author = dataMessage.data[1];
        if (
          dataMessage.data[0].id === taskData.authorId &&
          executer.id !== author.id
        ) {
          executer = dataMessage.data[1];
          author = dataMessage.data[0];
        }
        console.log("Recive users: ", executer, author);

        this.setState({
          taskDrawer: {
            ...this.state.taskDrawer,
            executer: executer,
            author: author,
          },
        });
      }
    );

    ConnectionManager.getInstance().emit(
      RequestType.GET_USERS_INFO,
      [taskData.executerId, taskData.authorId],
      Store.getState().account.session
    );

    this.setState({
      taskDrawer: {
        visible: true,
        task: taskData,
        onClose: this.onItemDrawerClose.bind(this),
      },
    });
  }

  onItemDrawerClose() {
    this.setState({
      taskDrawer: {
        visible: false,
        onClose: this.onItemDrawerClose.bind(this),
      },
    });
  }

  onLeftArrowClick() {
    Store.dispatch(
      setGetTaskDateInterval({
        from: addMonths(this.state.start, -1),
        to: addMonths(this.state.end, -1),
      })
    );
    this.setState(({ start, end }, props: any) => ({
      start: addMonths(start, -1),
      end: addMonths(end, -1),
    }));
  }

  onRightArrowClick() {
    Store.dispatch(
      setGetTaskDateInterval({
        from: addMonths(this.state.start, 1),
        to: addMonths(this.state.end, 1),
      })
    );
    this.setState(({ start, end }, props: any) => ({
      start: addMonths(start, 1),
      end: addMonths(end, 1),
    }));
  }

  componentWillMount() {
    const [start, end] = this.getStartEndMonth();
    this.setState({
      taskDrawer: {
        visible: false,
        onClose: this.onItemDrawerClose.bind(this),
      },
      start: start,
      end: end,
    });
    Store.dispatch(setGetTaskDateInterval({ from: start, to: end }));
  }

  getStartEndMonth(): Date[] {
    const date = new Date();
    date.setDate(1);
    date.setHours(0);

    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return [start, end];
  }

  render() {
    //Store.dispatch(setGetTaskDateInterval({ from: start, to: end }));

    const items: TimeLineItem[] = this.props.tasks
      .filter((item) => {
        return (
          item.status !== TaskStatus.COMPLITED &&
          ifTaskBetweenDates(this.state.start, this.state.end, item)
        );
      })
      .map((task) => {
        const item: TimeLineItem = {
          id: task.id,
          group: task.periodParentId,
          title: task.title,
          ...formatDateTaskForDisplay(task),
          canMove: true,
          canResize: false,
          canChangeGroup: false,
          data: {
            ...task,
          },
        };
        const backgroundColor =
          task.priority === TaskPriority.RED
            ? "#ff4d4f"
            : task.priority === TaskPriority.YELLOW
            ? "#ffec3d"
            : "#52c41a";
        const textColor =
          task.priority === TaskPriority.YELLOW ? "#262626" : "#fafafa";
        item.itemProps = {
          style: {
            backgroundColor: backgroundColor,
            borderRadius: "50px",
            color: textColor,
          },
          onMouseDown: this.onItemClicked.bind(this, item),
        };
        return item;
      });
    console.log(items);

    const groups: Array<{ id: number; title: string }> = [];
    for (var item of items) {
      const taskData = item.data as Task;
      const gr = { id: taskData.periodParentId, title: taskData.title };
      if (groups.findIndex((v) => v.id === gr.id) > -1) continue;

      groups.push(gr);
    }

    return (
      <div>
        <Row>
          <Col flex="33%">
            <Button
              type="primary"
              shape="circle"
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={this.onLeftArrowClick.bind(this)}
            ></Button>
          </Col>
          <Col flex="33%">
            <Text strong>
              {this.state.start
                .toLocaleString("uk", { month: "long", year: "numeric" })
                .toUpperCase()}
            </Text>
          </Col>
          <Col flex="33%">
            <Button
              type="primary"
              shape="circle"
              size="small"
              icon={<ArrowRightOutlined />}
              onClick={this.onRightArrowClick.bind(this)}
            ></Button>
          </Col>
        </Row>

        {items.length === 0 ? (
          <Empty></Empty>
        ) : (
          <Timeline
            groups={groups}
            items={items}
            minZoom={86400000}
            canMove={false}
            visibleTimeStart={this.state.start}
            visibleTimeEnd={this.state.end}
            itemRenderer={({
              item,
              itemContext,
              getItemProps,
              getResizeProps,
            }) => {
              const {
                left: leftResizeProps,
                right: rightResizeProps,
              } = getResizeProps();
              return (
                <div {...getItemProps(item.itemProps)}>
                  {itemContext.useResizeHandle ? (
                    <div {...leftResizeProps} />
                  ) : (
                    ""
                  )}

                  <div
                    className="rct-item-content"
                    style={{ maxHeight: `${itemContext.dimensions.height}` }}
                  >
                    {itemContext.title}
                  </div>

                  {itemContext.useResizeHandle ? (
                    <div {...rightResizeProps} />
                  ) : (
                    ""
                  )}
                </div>
              );
            }}
            groupRenderer={({ group }) => {
              return (
                <div
                  style={{
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                    }}
                  >
                    {group.title}
                  </span>
                </div>
              );
            }}
          >
            <TimelineHeaders className="sticky">
              <SidebarHeader>
                {({ getRootProps }) => {
                  const style = getRootProps();
                  style.style.backgroundColor = "#1890FF";
                  return <div {...style}></div>;
                }}
              </SidebarHeader>
              <DateHeader
                labelFormat="DD"
                style={{
                  height: 50,
                  fontSize: 15,
                  color: "#DFF0FF",
                  backgroundColor: "#1890FF",
                }}
                intervalRenderer={(dateHeaderProps) => {
                  return (
                    <div {...dateHeaderProps?.getIntervalProps()}>
                      {dateHeaderProps?.intervalContext.intervalText}
                    </div>
                  );
                }}
              />
            </TimelineHeaders>
          </Timeline>
        )}
        <TaskDrawer {...this.state?.taskDrawer}></TaskDrawer>
      </div>
    );
  }
}
