var data = [
  {id: 1, author: "Pete Hunt", text: "This is one comment"},
  {id: 2, author: "Jordan Walke", text: "This is *another* comment"}
];

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    //this ajax call takes in the URL defined from the initial call
    //it goes to the the route to get json
    //on success of reaching a valid route and json it sets state with the data to a javascript object called data.
    //the route hit by this ajax call is "/api/comments"
    //is api the root of the application?
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    //makes a post request to a route for submit
    var comments = this.state.data;

    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    //componentDidMount is called automatically by React after a component is rendered for the first time
    //this data in setState can also be updated using WebSockets
    //polling is used instead which will check at intervals for new data.

    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    //iterates over the data with map
    //each element of the property data is a comment
    //each comment returns a Comment which is a react class
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  //events for React classes?
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    //callback to CommentBox parent to render
    this.props.onCommentSubmit({author: author, text: text});
    //after form is passed to comment box it is cleared
    this.setState({author: '', text: ''})
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Enter your name" value={this.state.author} onChange={this.handleAuthorChange} />
        <textarea type="text" placeholder="say what you like..." value={this.state.text} onChange={this.handleTextChange} />
        <input type="submit" value="Post" />
      </form>
    );
  }
});
//Think of Comment like a function.
//Any number of arguments(props) can be passed into it
//These props can be called by calling this.props.(property name) to access it
//this.props.children returns anything inbetween the comment tag
//adding rawMarkup allows us to convert and sanitize
//raw markup is called by the render function part of the comment class
//is render the default function called when using react?
// <Comment /> calls render for that react class?
//Curious about dangerouslySetInnerHTML, does it go around reacts protection for XSS attacks?

var Comment = React.createClass({
  rawMarkup: function() {
      var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
      return {__html: rawMarkup };
    },
  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

//passes in data to CommentBox as a property from data set defined.
// this property is then passed to comment list
ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={2000} />,
  document.getElementById('content')
);

