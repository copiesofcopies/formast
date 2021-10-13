# Ant Design集成包

为开发者提供最简单的内置主题。

> 注意：你的构建工具需支持编译 less 作为样式。

## 使用

表单：

```js
import { Formast } from '@tencent/formast/react';
import * as Options from '@tencent/formast/antd';

function MyFormast(props) {
  return <Formast options={Options} {...props} />
}
```

编辑器：

```js
import { mountVisualEditor } from '@tencent/formast/visual';
import * as Config from '@tencent/formast/antd/editor';

requestData().then((formJson) => {
  mountVisualEditor('#editor', {
    data: formJson, // 基于 Schema 的 JSON 对象，初始值
    config: Config, // 配置信息，已经内置了，你也可以自己调整 Config 后再传入
    onChange: (newFormJson) => {
      console.debug(newFormJson);
      // TODO 将新的 JSON 保存到服务端
    },
  })
})
```

## 支持的组件

Form,
Item,
Input,
TextArea,
InputNumber,
Radios,
Checkboxes,
Select,
Password,
Search,
Switch,
Rate,
DatePicker,
Slider,
Button

其他组件如有需求请在 issues 中提。
