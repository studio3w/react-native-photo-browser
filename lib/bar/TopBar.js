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
    const {
      displayed,
      title,
      height,
      onBack,
    } = this.props;

    return (
      <BarContainer
        style={styles.container}
        displayed={displayed}
        height={height}
      >
        <TouchableOpacity style={styles.backContainer} onPress={onBack}>
          {
            this._getBackIcon()
          }
        </TouchableOpacity>
        <Text style={styles.text}>{title}</Text>
      </BarContainer>
    );
  }

  _getBackIcon() {

    return (
      <ART.Surface
          width={Constants.BACK_BUTTON_SIZE}
          height={Constants.BACK_BUTTON_SIZE}
      >
        <ART.Shape
            d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
            fill="rgb(255,255,255)"
            transform={new ART.Transform().scaleTo(1, 1)}
        />
      </ART.Surface>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 30,
  },
  text: {
    fontSize: 18,
    color: 'white',
    paddingTop:6,
  },
  backContainer: {
    position: 'absolute',
    flexDirection: 'row',
    left: 0,
    top: 16,
    paddingTop:20,
    paddingLeft:16,
  },
  backText: {
    paddingTop: 14,
    marginLeft: -10,
  },
});
