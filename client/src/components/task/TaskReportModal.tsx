import { Button, Input } from "antd";
import React, { useState, useEffect } from "react";

interface TaskReportProps {
  startValue: string;
  onOk: (report: string) => void;
  onCancel: () => void;
}
export const TaskReportModal: React.FC<TaskReportProps> = (props) => {
  const [enteredReport, setEnteredReport] = useState<string>(props.startValue);

  const saveReport: (event: React.ChangeEvent<HTMLTextAreaElement>) => void = ({
    target: { value },
  }) => {
    setEnteredReport(value);
    console.log(value);
  };

  return (
    <div>
      <Input.TextArea
        placeholder="Введіть ваш звіт"
        onChange={saveReport}
      ></Input.TextArea>
      <Button
        style={{
          float: "right",
          marginTop: "50px",
        }}
        disabled={enteredReport === ""}
        type={"primary"}
        onClick={() => {
          props.onOk(enteredReport);
        }}
      >
        Ok
      </Button>
      <Button
        style={{
          float: "right",
          marginTop: "50px",
          marginRight: "10px",
        }}
        type={"default"}
        onClick={() => {
          props.onCancel();
        }}
      >
        Відміна
      </Button>
    </div>
  );
};
