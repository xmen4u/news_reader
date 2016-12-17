'use strict';
const React = require('react');
const ReactNative = require('react-native');
const {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  View,
  Image,
  ScrollView,
  TouchableHighlight,
  AsyncStorage
} = ReactNative;


var moment = require('moment');

const MAX_NEWS_ITEMS = 100;
const DEFAULT_IMG = 'https://facebook.github.io/react/img/logo_small.png';

var NewsItems = React.createClass({

    getInitialState: function() {

      AsyncStorage.clear()
        return {
          title: 'News Reader',
          dataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
          }),
          news: {},
          loaded: false
        }
    },

    render: function() {

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.header_item}>
                        <Text style={styles.header_text}>{this.state.title}</Text>
                    </View>
                    <View style={styles.header_item}>
                    {  !this.state.loaded /*&&
                        <GiftedSpinner />*/
                    }
                    </View>
                </View>
                <View style={styles.body}>
                  <ScrollView ref="scrollView">
                  {
                      this.state.loaded &&
                      <ListView initialListSize={1} dataSource={this.state.news} style={styles.news} renderRow={this.renderNews}></ListView>

                  }
                  </ScrollView>
                </View>
            </View>
        );

    },

    componentDidMount: function() {

        AsyncStorage.getItem('news_items').then((news_items_str) => {

            var news_items = JSON.parse(news_items_str);

            if(news_items != null){

                AsyncStorage.getItem('time').then((time_str) => {
                    var time = JSON.parse(time_str);
                    var last_cache = time.last_cache;
                    var current_datetime = moment();

                    var diff_days = current_datetime.diff(last_cache, 'days');

                    if(diff_days > 0){
                        this.getNews();
                    }else{
                        this.updateNewsItemsUI(news_items);
                    }

                });


            }else{
                this.getNews();
            }

        }).done();

    },

    renderNews: function(news) {
        return (
            <TouchableHighlight onPress={this.viewPage.bind(this, news.url, news.title)} underlayColor={"#E8E8E8"} style={styles.button}>
            <View style={styles.news_item}>
                <Image
                style={styles.resizeMode}
                resizeMode={Image.resizeMode.stretch}
                source={{uri: news.img, width: 32, height: 32}}
                />
                <View style={{flex: 1}}>
                  <Text style={styles.news_item_text}>{news.title}</Text>
                </View>

            </View>
            </TouchableHighlight>
        );
    },

    viewPage: function(url, title) {
      this.props.navigator.push({name: 'articles', url: url, pageTitle: title});
    },

    updateNewsItemsUI: function(news_items) {

        if(news_items.length <= MAX_NEWS_ITEMS){
            var ds = this.state.dataSource.cloneWithRows(news_items);
            console.log(ds);
            this.setState({
              'news': ds,
              'loaded': true
            });
        }
    },

    updateNewsItemDB: function(news_items) {

        if(news_items.length <= MAX_NEWS_ITEMS){
            AsyncStorage.setItem('news_items', JSON.stringify(news_items));
        }

    },

    getNews: async function() {
      const URL = 'https://newsapi.org/v1/sources?language=en';
      const response = await fetch(URL);
      const json = await response.json();
      const sources = json.sources.slice(0,MAX_NEWS_ITEMS) || [];

      AsyncStorage.setItem('time', JSON.stringify({'last_cache': moment()}));

      const rowData = Array.from(sources)
      .map((val, i) => ({
        title: val.name || 'blurb',
        clicks: 0,
        img: val.urlsToLogos.small || DEFAULT_IMG,
        url: val.id
      }))
      this.updateNewsItemsUI(rowData);
      this.updateNewsItemDB(rowData);
    }

});


var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    backgroundColor: '#d1dcff',
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  body: {
    flex: 9,
    backgroundColor: '#F6F6EF'
  },
  header_item: {
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center'
  },
  header_text: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15
  },
  button: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  news_item: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 5,
    flexDirection: 'row'
  },
  news_item_text: {
    color: '#575757',
    fontSize: 18,
    paddingLeft: 10
  }
});

module.exports = NewsItems;
