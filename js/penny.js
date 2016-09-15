(function() {
  
  //var penny = { };
  
  var vm = new Vue({
    el: '#penny-app',
    data: {
			printing: true,
      data: { },
      meta: { },
      content: [ ]
    },
    filters: {
      marked: marked
    }
  });
  
  window.vm = vm;

  function fetchFile(path, callback) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
          if (httpRequest.readyState === 4) {
              if (httpRequest.status === 200) {
                  //var data = JSON.parse(httpRequest.responseText);
                  //if (callback) callback(data);
                  if (callback) callback(httpRequest.responseText);
              }
          }
      };
      httpRequest.open('GET', path);
      httpRequest.send(); 
  }

  function loadIssue (No) {
    
    // start printing this issue
		vm.printing = true;
    
    // find the requested issue in the catalog
    vm.meta = vm.data.Issues.find(function (item) {
      return item.No == No;
      });
    if (vm.meta) {
      
      // ask for the issue article content list
      var issuepath = 'issues/'+ vm.meta.No +'/';
      fetchFile(issuepath +'content.json', function(data){
        vm.content = [ ];
        var content = JSON.parse(data);
        
        // print each article
        content.stories.forEach(function (storydata) {
          var storytext = fetchFile(issuepath + storydata.file, function(data){
            storydata.content = data
            vm.content.push(storydata);
          });
          
        // we are done printing this issue
        setTimeout(function() {
          vm.printing = false;
        }, 1000);
        
        });
      });
    }
  }

  // set markdown options
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: false,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });

  // load catalog of issues
  fetchFile('issues/catalog.json', function(data){
      vm.data = JSON.parse(data);
      // view latest
      if (vm.data.Issues.length > 0) {
        loadIssue (vm.data.Issues.slice(-1).pop().No);
      }
  });

  
})();
