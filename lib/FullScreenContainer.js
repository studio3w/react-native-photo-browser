import React, { PropTypes } from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  ListView,
  View,
  ViewPagerAndroid,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';

import Constants from './constants';
import { BottomBar } from './bar';
import { Photo } from './media';

export default class FullScreenContainer extends React.Component {

  static propTypes = {
    style: View.propTypes.style,
    dataSource: PropTypes.instanceOf(ListView.DataSource).isRequired,
    mediaList: PropTypes.array.isRequired,
    /*
     * opens grid view
     */
    onGridButtonTap: PropTypes.func,

    /*
     * updates top bar title
     */
    updateTitle: PropTypes.func,

    /*
     * displays/hides top bar
     */
    toggleTopBar: PropTypes.func,

    /*
     * refresh the list to apply selection change
     */
    onMediaSelection: PropTypes.func,

    /*
     * those props are inherited from main PhotoBrowser component
     * i.e. index.js
     */
    initialIndex: PropTypes.number,
    alwaysShowControls: PropTypes.bool,
    displayActionButton: PropTypes.bool,
    displayNavArrows: PropTypes.bool,
    displaySelectionButtons: PropTypes.bool,
    enableGrid: PropTypes.bool,
    useCircleProgress: PropTypes.bool,
    onActionButton: PropTypes.func,
  };

  static defaultProps = {
    initialIndex: 0,
    displayNavArrows: false,
    displaySelectionButtons: false,
    enableGrid: true,
    onGridButtonTap: () => {},
  };

  constructor(props, context) {
    super(props, context);

    this._renderRow = this._renderRow.bind(this);
    this._toggleControls = this._toggleControls.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onPageSelected = this._onPageSelected.bind(this);
    this._onNextButtonTapped = this._onNextButtonTapped.bind(this);
    this._onPreviousButtonTapped = this._onPreviousButtonTapped.bind(this);
    this._onActionButtonTapped = this._onActionButtonTapped.bind(this);

    this.photoRefs = [];
    this.state = {
      currentIndex: props.initialIndex,
      currentMedia: props.mediaList[props.initialIndex],
      controlsDisplayed: true,
    };
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('didUpdateDimensions', () => {
      this.photoRefs.map(p => p && p.forceUpdate());
      this.openPage(this.state.currentIndex, false);
    });

    this.openPage(this.state.currentIndex, false);
  }

  openPage(index, animated) {
    if (!this.scrollView) {
      return;
    }

    if (Platform.OS === 'ios') {
      const screenWidth = Dimensions.get('window').width;
      this.scrollView.scrollTo({
        x: index * screenWidth,
        animated,
      });
    } else {
      this.scrollView.setPageWithoutAnimation(index);
    }

    this._updatePageIndex(index);
  }

  _isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
  }

  _updatePageIndex(index) {

    // Bugfix for Infinity
    if (!this._isInt(index)) {
      return;
    }

    this.setState({
      currentIndex: index,
      currentMedia: this.props.mediaList[index],
    }, () => {
      this._triggerPhotoLoad(index);

      const newTitle = `${index + 1} von ${this.props.dataSource.getRowCount()}`;
      this.props.updateTitle(newTitle);
    });
  }

  _triggerPhotoLoad(index) {
    const photo = this.photoRefs[index];
    if (photo) {
      photo.load();
    } else {
      // HACK: photo might be undefined when user taps a photo from gridview
      // that hasn't been rendered yet.
      // photo is rendered after listView's scrollTo method call
      // and i'm deferring photo load method for that.
      setTimeout(this._triggerPhotoLoad.bind(this, index), 200);
    }

    // Preload next and previous "number" photos as well
    const number = 2;

    for (let i=-number; i<=number; i++) {

      if (i == 0) {
        continue;
      }

      let nextPhoto = this.photoRefs[index+i];

      if (nextPhoto) {
        nextPhoto.load();
      }

    }

  }

  _toggleControls() {
    const { alwaysShowControls, toggleTopBar } = this.props;

    if (!alwaysShowControls) {
      const controlsDisplayed = !this.state.controlsDisplayed;
      this.setState({
        controlsDisplayed,
      });
      toggleTopBar(controlsDisplayed);
    }
  }

  _onNextButtonTapped() {
    let nextIndex = this.state.currentIndex + 1;
    // go back to the first item when there is no more next item
    if (nextIndex > this.props.dataSource.getRowCount() - 1) {
      nextIndex = 0;
    }
    this.openPage(nextIndex, false);
  }

  _onPreviousButtonTapped() {
    let prevIndex = this.state.currentIndex - 1;
    // go to the last item when there is no more previous item
    if (prevIndex < 0) {
      prevIndex = this.props.dataSource.getRowCount() - 1;
    }
    this.openPage(prevIndex, false);
  }

  _onActionButtonTapped() {
    const onActionButton = this.props.onActionButton;

    // action behaviour must be implemented by the client
    // so, call the client method or simply ignore this event
    if (onActionButton) {
      const { currentMedia, currentIndex } = this.state;
      onActionButton(currentMedia, currentIndex);
    }
  }

  _onScroll(e) {
    const event = e.nativeEvent;
    const layoutWidth = event.layoutMeasurement.width;
    const newIndex = Math.floor((event.contentOffset.x + 0.5 * layoutWidth) / layoutWidth);

    this._onPageSelected(newIndex);
  }

  _onPageSelected(page) {
    const { currentIndex } = this.state;
    let newIndex = page;

    // handle ViewPagerAndroid argument
    if (typeof newIndex === 'object') {
      newIndex = newIndex.nativeEvent.position;
    }

    if (currentIndex !== newIndex) {
      this._updatePageIndex(newIndex);

      if (this.state.controlsDisplayed) {
        this._toggleControls();
      }
    }
  }

  _renderRow(media: Object, sectionID: number, rowID: number) {
    const {
      displaySelectionButtons,
      onMediaSelection,
      useCircleProgress,
    } = this.props;

    const uri = media.photo;

    return (
      <View key={`row_${rowID}`} style={styles.flex}>
        <TouchableWithoutFeedback onPress={this._toggleControls}>
          <Photo
            ref={ref => this.photoRefs[rowID] = ref}
            key={uri}
            lazyLoad
            useCircleProgress={useCircleProgress}
            uri={uri}
            displaySelectionButtons={displaySelectionButtons}
            selected={media.selected}
            onSelection={(isSelected) => {
              onMediaSelection(rowID, isSelected);
            }}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }

  // This method can be used to render only the scrollable content, not the whole browser, if you want
  renderScrollableContent() {
    const { dataSource, mediaList } = this.props;

    if (Platform.OS === 'android') {
      return (
        <ViewPagerAndroid
          style={styles.flex}
          ref={scrollView => this.scrollView = scrollView}
          onPageSelected={this._onPageSelected}
        >
          {mediaList.map((child, idx) => this._renderRow(child, 0, idx))}
        </ViewPagerAndroid>
      );
    }

    return (
      <ListView
        ref={scrollView => this.scrollView = scrollView}
        dataSource={dataSource}
        renderRow={this._renderRow}
        onScroll={this._onScroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
        scrollEventThrottle={16}
      />
    );
  }

  render() {
    const {
      displayNavArrows,
      displayActionButton,
      onGridButtonTap,
      enableGrid,
    } = this.props;
    const { controlsDisplayed, currentMedia } = this.state;

    return (
      <View style={styles.flex}>
        <StatusBar
          hidden={!controlsDisplayed}
          showHideTransition={'slide'}
          barStyle={'light-content'}
          animated
          translucent
        />
        {this.renderScrollableContent()}
        <BottomBar
          displayed={controlsDisplayed}
          height={Constants.TOOLBAR_HEIGHT}
          displayNavArrows={displayNavArrows}
          displayGridButton={enableGrid}
          displayActionButton={displayActionButton}
          onPrev={this._onPreviousButtonTapped}
          onNext={this._onNextButtonTapped}
          onGrid={onGridButtonTap}
          onAction={this._onActionButtonTapped}
          caption={currentMedia.caption}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
