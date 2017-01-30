import React, { PropTypes } from 'react';
import {
  ART,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';

import Constants from '../constants';

import { BarContainer } from './BarContainer';

export default class TopBar extends React.Component {

  static propTypes = {
    displayed: PropTypes.bool,
    title: PropTypes.string,
    height: PropTypes.number,
    onBack: PropTypes.func,
  };

  static defaultProps = {
    displayed: false,
    title: '',
  };

  constructor(props) {
    super(props);
  }

  render() {

    let containerPaddingTop = 10;
    let backContainerPaddingTop = 0;

    if (Platform.OS === 'android') {
        containerPaddingTop += Constants.TOOLBAR_PADDING_TOP_ANDROID;
        backContainerPaddingTop += Constants.TOOLBAR_PADDING_TOP_ANDROID;
    }

    if (Platform.OS === 'ios') {
        containerPaddingTop += Constants.TOOLBAR_PADDING_TOP_IOS;
        backContainerPaddingTop += Constants.TOOLBAR_PADDING_TOP_IOS;
    }

    const {
      displayed,
      title,
      height,
    } = this.props;

    return (
      <BarContainer
        style={[styles.container, {paddingTop: containerPaddingTop}]}
        displayed={displayed}
        height={height}
      >
        <Text style={styles.text}>{title}</Text>
        { this._getBackButton(backContainerPaddingTop) }
      </BarContainer>
    );
  }

  _getBackButton(backContainerPaddingTop) {

    return (
        <TouchableOpacity style={[styles.backContainer, {paddingTop: backContainerPaddingTop}]} onPress={this.props.onBack}>
            <Text style={styles.text}>Fertig</Text>
        </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
    paddingTop:6,
  },
  backContainer: {
    position: 'absolute',
    flexDirection: 'row',
    right: 0,
    top: 10,
    paddingRight:16,
  },
});
