import { React, Component, produce } from 'nautil';
import { LayoutEditor } from './layout';
import { ModelEditor } from './model';
import { Modal } from 'antd';
import { ModelEditContext, FieldsSearchContext } from './layout/context.js';
import { each, isArray, makeKeyPath } from 'ts-fns';
import { isSubKey } from './shared/utils.js';
import { isExp, getExp, parseRepeat } from '../core/utils.js';

export class VisualEditor extends Component {
  static props = {
    data: {
      model: Object,
      layout: Object,
    },
    config: {
      layout: Object,
    },
    onChange: true,
  }

  state = {
    showModelEditor: false,
  }

  onInit() {
    this.fields = [];
    const { data = {} } = this.props;
    const { model } = data;
    if (model) {
      this.initFields(model);
    }
  }

  handleChangeLayout = (layoutJson) => {
    const { data, onChange } = this.props;
    const next = produce(data, (data) => {
      data.layout = layoutJson; // eslint-disable-line
    });
    onChange(next);
  }

  handleChangeModel = (modelJson) => {
    const { data, onChange } = this.props;
    const next = produce(data, (data) => {
      data.model = modelJson; // eslint-disable-line
    });
    onChange(next);
    this.initFields(modelJson);
  }

  initFields(modelJson) {
    const get = (modelJson, parents = []) => {
      const fields = [];
      const subs = [];
      each(modelJson, (meta, value) => {
        const push = () => {
          const chain = [...parents, value];
          const { label } = meta;
          const key = makeKeyPath(chain);
          fields.push({
            label: `${label}: ${key}`,
            value: key,
          });
        };
        if (isSubKey(value)) {
          const key = value.substring(1, value.length - 1);
          if (isArray(meta)) {
            const sub = meta[0];
            const chain = [...parents, key, '*'];
            const subFields = get(sub, chain);
            subs.push(...subFields);
          } else {
            const chain = [...parents, key];
            const subFields = get(meta, chain);
            subs.push(...subFields);
          }
        } else {
          push();
        }
      });
      fields.push(...subs);
      return fields;
    };
    const fields = get(modelJson);
    this.fields = fields;
  }

  handleSearchFields(str, layoutStore) {
    const { selectedKeyPath, layoutJson } = layoutStore.state;

    let model = layoutJson.model || ''; // ??????
    let node = layoutJson;
    for (let i = 0, len = selectedKeyPath.length; i < len; i ++) {
      const key = selectedKeyPath[i];
      node = node[key];

      if (!node) {
        model = '';
        break;
      }

      if (!node.type) {
        continue;
      }

      if (!node.model) {
        continue;
      }

      // ?????????????????????
      if (node.model === false) {
        model = '';
        continue;
      }

      // ??????????????????
      // ???????????????????????????????????????????????????????????????
      if (isExp(node.model)) {
        if (!node.repeat) {
          continue;
        }

        if (node.repeat) {
          const [items, item] = parseRepeat(node.repeat);
          if (isExp(items)) {
            continue;
          }

          const modelStr = getExp(node.model);
          if (modelStr !== item) {
            continue;
          }

          model = `${items}.*`;
        }
        continue;
      }

      model = node.model;
    }

    const filtered = this.fields.filter(({ label, value }) => {
      // ????????????????????????
      if (model && value.indexOf(model) === 0) {
        return true;
      }
      // ???????????????????????????????????????????????????????????????????????????
      if (value.indexOf('.*.') > -1) {
        return false;
      }
      if (`${label}`.toLowerCase().indexOf(str.toLowerCase()) > -1) {
        return true;
      }
      if (`${value}`.toLowerCase().indexOf(str.toLowerCase()) > -1) {
        return true;
      }
      return false;
    });

    return filtered.map((item) => {
      const { label, value } = item;
      // ?????????????????????????????????????????????
      if (value.indexOf('.*.') > -1) {
        const s = value.split('.*.').pop();
        return { label, value: s };
      }
      return item;
    });
  }

  modelEditContext = <span onClick={() => this.setState({ showModelEditor: true })} className="formast-visual-editor__edit-model">??????</span>;
  fieldsSearchContext = (...args) => this.handleSearchFields(...args);

  render() {
    const { data, config } = this.props;
    const { showModelEditor } = this.state;
    return (
      <FieldsSearchContext.Provider value={this.fieldsSearchContext}>
        <ModelEditContext.Provider value={this.modelEditContext}>
          <div className="formast-visual-editor">
            <LayoutEditor
              data={data.layout}
              config={config.layout}
              store={this.layoutEditorStore}
              onChange={this.handleChangeLayout}
            />
            <Modal visible={showModelEditor} title="????????????" footer={null} onCancel={() => this.setState({ showModelEditor: false })} width={900}>
              <ModelEditor data={data.model} onChange={this.handleChangeModel} store={this.modelEditorStore} />
            </Modal>
          </div>
        </ModelEditContext.Provider>
      </FieldsSearchContext.Provider>
    );
  }
}
