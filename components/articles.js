const React = require('react');
const ReactNative = require('react-native');
const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ListView,
  ScrollView,
  AsyncStorage,
  TouchableHighlight
} = ReactNative;

var moment = require('moment');

const MAX_ARTICLES = 100;
const DEFAULT_IMG = 'https://facebook.github.io/react/img/logo_small.png';

var WebPage = React.createClass({
    getInitialState: function() {
      AsyncStorage.clear()
        return {
          dataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
          }),
          articles: {},
          loaded: false
        };
    },

    render: function(){

        return (<View style={styles.container}>

            <View style={styles.webview_header}>
              <View style={styles.header_item}>
                <TouchableHighlight onPress={this.back}>
                  <Text style={styles.button_text}>Back</Text>
                </TouchableHighlight>
              </View>
              <View style={styles.header_item}>
                <Text style={styles.page_title}>{this.props.route.pageTitle.slice(0,20)}</Text>
              </View>
              <View style={[styles.header_item, styles.spinner]}>
              </View>
            </View>

            <View style={styles.webview_body}>
              <ScrollView ref="scrollView">
              {
                  this.state.loaded &&
                  <ListView initialListSize={1} dataSource={this.state.articles} style={styles.articles} renderRow={this.renderArticles}></ListView>

              }
              </ScrollView>
            </View>
        </View>);

    },
    componentDidMount: function() {

        AsyncStorage.getItem('articles_items_' + this.props.url).then((articles_items_str) => {

            var articles_items = JSON.parse(articles_items_str);

            if(articles_items != null){

                AsyncStorage.getItem('time').then((time_str) => {
                    var time = JSON.parse(time_str);
                    var last_cache = time.last_cache;
                    var current_datetime = moment();

                    var diff_days = current_datetime.diff(last_cache, 'days');

                    if(diff_days > 0){
                        this.getArticles();
                    }else{
                        this.updateArticlesItemsUI(articles_items);
                    }

                });


            }else{
                this.getArticles();
            }

        }).done();

    },

    renderArticles: function(articles) {
        return (
            <TouchableHighlight underlayColor={"#E8E8E8"} style={styles.button}>
            <View style={styles.articles_item}>
                <Image
                style={styles.resizeMode}
                resizeMode={Image.resizeMode.stretch}
                source={{uri: articles.img, width: 32, height: 32}}
                />
                <View style={{flex: 1}}>
                  <Text style={styles.articles_item_text}>{articles.title}</Text>
                </View>

            </View>
            </TouchableHighlight>
        );
    },

    updateArticlesItemsUI: function(articles_items) {

        if(articles_items.length <= MAX_ARTICLES){
            var ds = this.state.dataSource.cloneWithRows(articles_items);
            this.setState({
              'articles': ds,
              'loaded': true
            });
        }

    },

    updateArticlesItemDB: function(articles_items) {

        if(articles_items.length <= MAX_ARTICLES){
            AsyncStorage.setItem('articles_items_' + articles_items.url, JSON.stringify(articles_items.data));
        }

    },

    getArticles: async function() {
      let api_key = '';
      let URL = `https://newsapi.org/v1/articles?source=${this.props.url}&sortBy=top&apiKey=${api_key}`;

      const response = await fetch(URL);
      const json = await response.json();
      const sources = json.articles.slice(0,MAX_ARTICLES) || [];

      AsyncStorage.setItem('time', JSON.stringify({'last_cache': moment()}));

      const rowData = Array.from(sources)
      .map((val, i) => ({
        title: val.title || 'blurb',
        author: val.author,
        img: val.urlToImage || DEFAULT_IMG
      }))
      this.updateArticlesItemsUI(rowData);
      this.updateArticlesItemDB({url:this.props.url, data: rowData});
    },

    back: function(){
       this.props.navigator.pop();
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    webview_header: {
        paddingLeft: 10,
        backgroundColor: '#d1dcff',
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    header_item: {
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center'
    },
    webview_body: {
        flex: 9
    },
    button_text: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 15
    },
    page_title: {
        color: '#FFF'
    },
    articles_item: {
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 15,
      paddingBottom: 15,
      marginBottom: 5,
      flexDirection: 'row'
    },
    articles_item_text: {
      color: '#575757',
      fontSize: 18,
      paddingLeft: 10
    },
    spinner: {
        alignItems: 'flex-end'
    }
});

module.exports = WebPage;
