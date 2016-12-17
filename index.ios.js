'use strict';
const React = require('react');
const ReactNative = require('react-native');
const {
  AppRegistry,
  StyleSheet,
  Navigator
} = ReactNative;

var NewsSources = require('./components/news');
var Articles = require('./components/articles');

var ROUTES = {
  news_sources: NewsSources,
  articles: Articles
};

var NewsReader = React.createClass({
  renderScene: function(route, navigator) {

    var Component = ROUTES[route.name];
    return (
        <Component route={route} navigator={navigator} url={route.url} />
    );
  },

  render: function() {
    return (
      <Navigator
        style={styles.container}
        initialRoute={{name: 'news_sources', url: ''}}
        renderScene={this.renderScene}
        configureScene={() => { return Navigator.SceneConfigs.FloatFromRight; }} />
    );

  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent('NewsReader', () => NewsReader);

