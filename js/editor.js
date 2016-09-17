(function() {
  
  var defaultIssueObject = '{"No":"", "Title":"", "Date":""}';
  var defaultArticleObject = '{"File":"", "Type":"article"}';
  
  var vm = new Vue({
    el: '#app',
    data: {
      view: 'issuelist',
      data: { },
      errormessage: '',
      issue: { },
      articles: [ ],
      failures: [ ],
      issueJSON: '',
      catalogJSON: ''
    },
    methods: {
      loadIssue: function (id) {
        loadIssue (vm.data.Issues[id].No);
        vm.view = 'issuedetails';
        vm.failures = [ ];
        vm.issueJSON = '';
        vm.catalogJSON = '';
      },
      addArticle: function () {
        var newarticle = JSON.parse(defaultArticleObject);
        this.articles.Stories.push(newarticle);
      },
      removeArticle: function (index) {
        this.articles.Stories.splice(index, 1)
      },
      testArticles: function () {
        testArticles();
      },
      generateIssueJSON: function () {
        vm.issueJSON = JSON.stringify(vm.articles);
        vm.catalogJSON = JSON.stringify(vm.data);
        setTimeout(function(){
          var el = document.getElementById('issueJSONtext');
          el.focus();
          el.select();
        }, 250);
      },
      backWithPrompt: function () {
        if (confirm('Back to issue list and lose uncopied JSON?')) {
          vm.view = 'issuelist';
        }
      },
      backWithoutPrompt: function () {
        vm.view = 'issuelist';
      },
      addIssue: function () {
        var next = 0;
        for (var i=0; i<vm.data.Issues.length; i++) {
          var no = parseInt(vm.data.Issues[i].No);
          if (no > next) {
            next = no;
          }
        }
        next++;
        var newissue = JSON.parse(defaultIssueObject);
        newissue.No = next;
        vm.data.Issues.push(newissue);
      },
      removeIssue: function (index) {
        vm.data.Issues.splice(index, 1);
      }
    },
    filters: {
      marked: marked
    }
  });

  function fetchFile(path, callback, failcallback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          if (callback) callback(httpRequest.responseText);
        }
        else {
          // something went wrong
          if (failcallback) failcallback(httpRequest.statusText +': '+ httpRequest.responseURL);
        }
      }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
  }

  function loadIssue (No) {
    
    // find the requested issue in the catalog
    vm.issue = vm.data.Issues.find(function (item) {
      return item.No == No;
      });
      
    if (vm.issue) {
      
      // ask for the issue article content list
      var issuepath = 'issues/'+ vm.issue.No +'/';
      fetchFile(issuepath +'content.json',
        function (data){
          vm.articles = JSON.parse(data);
        },
        function (error) {
          // new issues that don't have article data yet
          vm.articles = { Stories: [] };
        }
        );
    }
    else {
      // that issue is not in our list
      console.warn('Issue no '+ No +' does not exist.')
    }
    
  }

  // load catalog of issues
  fetchFile('issues/catalog.json', function(data){
    vm.data = JSON.parse(data);
  });

  // test if we can load all the article files
  function testArticles () {
    var issuepath = 'issues/'+ vm.issue.No +'/';
    vm.failures = [ ];
    vm.articles.Stories.forEach(function (storydata) {
      if (storydata.File == '') {
        vm.failures.push('article file is empty');
      }
      fetchFile(issuepath + storydata.File, null, function(data){
        // failure callback
        vm.failures.push(data);
      });
    });
  }
  
  window.vm = vm;

  // prompt if the user tries to navigate away from the page
  window.onbeforeunload = function() {
    return "Are you sure you want to navigate away?";
  }

})();
