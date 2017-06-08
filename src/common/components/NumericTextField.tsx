import React, {Component} from 'react';
import TextField from 'material-ui/TextField';

interface NumericTextFieldProps extends __MaterialUI.TextFieldProps {
  onChange?: (event: React.FormEvent<{}>, value: string) => void;
}

const normalizeInput = (value: string) => value.replace(/\D/g, '');

class NumericTextField extends Component<NumericTextFieldProps, any> {
  render() {
    return (
      <TextField
        {...this.props}
        onChange={this.handleChange}
      />
    );
  }

  private handleChange = (event) => {
    const value = normalizeInput(event.target.value);
    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  }
}

export {
  normalizeInput,
};

export default NumericTextField;
