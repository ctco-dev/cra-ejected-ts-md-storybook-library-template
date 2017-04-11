import * as React from 'react';
import TextField from 'material-ui/TextField';

interface NumericTextFieldProps extends __MaterialUI.TextFieldProps {
  onChange: (event: any, value: string) => void;
}

class NumericTextField extends React.Component<NumericTextFieldProps, any> {

  render() {
    return (
      <TextField
        {...this.props}
        onChange={this.handleChange}
      />
    );
  }

  private handleChange = (event) => {
    const value = this.normalizeInput(event.target.value);
    this.props.onChange(event, value);
  }

  private normalizeInput(value) {
    return value.replace(/\D/g, '');
  }
}

export default NumericTextField;
