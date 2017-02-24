import {themr} from 'react-css-themr';
import identifiers from './../identifiers.js';
import style from './style.css';
import SelectBox from './selectBox.js';

const ThemedSelectBox = themr(identifiers.selectBox, style)(SelectBox);

//
// Dependency injection
//
import injectProps from './../_lib/injectProps.js';
import DropDown from './../DropDown/index';
import Icon from './../Icon/index';
import TextInput from './../TextInput/index';
import SearchableSelectBox from 'SearchableSelectBox/index';
import SimpleSelectBox from 'SimpleSelectBox/index';

export default injectProps({
    DropDownComponent: DropDown,
    IconComponent: Icon,
    InputComponent: TextInput,
    SearchableSelectBoxComponent: SearchableSelectBox,
    SimpleSelectBoxComponent: SimpleSelectBox
})(ThemedSelectBox);
