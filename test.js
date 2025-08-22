// Our official coze sdk for JavaScript [coze-js](https://github.com/coze-dev/coze-js)
import { CozeAPI } from '@coze/api';

const apiClient = new CozeAPI({
  token: 'cztei_q5Lfc8vOBM5GEc3sRiEQf7L9VO1cncOGM7az5SdOjEnAh4uBkP5czD357neWyApE8',
  baseURL: 'https://api.coze.cn'
});
const res = await apiClient.workflows.runs.create({
  workflow_id: '7538406479310258230',
  parameters: {
  "input": {
    "live_room_id": 1000,
    "text": "这款手机有什么颜色呀？"
  }
},
});
console.log(res.data);