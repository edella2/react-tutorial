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
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    //componentDidMount is called automatically by React after a component is rendered for the first time
    //this data in setState can also be updated using WebSockets

    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm />
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
  render: function() {
    return (
      <div className="commentForm">
        Hello, world! I am a CommentForm.
      </div>
    )
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
  <CommentBox url="/api/comments" />,
  document.getElementById('content')
);

