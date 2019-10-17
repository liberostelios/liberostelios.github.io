if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      search_term: "",
      citymodel: {},
      selected_objid: null,
    },
    created() {
      let self = this;

      this.$root.$on('object_clicked', (objid) => {
        self.move_to_object(objid);
      });
    },
    watch: {
      selected_objid: function() {
        var card_id = $.escapeSelector(this.selected_objid);
        $(`#${card_id}`)[0].scrollIntoViewIfNeeded();
      }
    },
    computed: {
      filteredCityObjects: function() {
        var result = _.pickBy(this.citymodel.CityObjects, function(value, key) {
          var regex = RegExp(this.search_term, "i");
          var obj_json = JSON.stringify(value);
          return regex.test(key) | regex.test(obj_json);
        });

        return result;
      }
    },
    methods: {
      move_to_object(objid) {
        this.selected_objid = objid;
      },
      reset() {
        this.citymodel = {};
        this.search_term = "";
        this.file_loaded = false;
      },
      matches(coid, cityobject) {
        var regex = RegExp(this.search_term, "i");
        var obj_json = JSON.stringify(cityobject);
        return regex.test(coid) | regex.test(obj_json);
      },
      selectedFile() {
        console.log("Selected a CityJSON file...");
        console.log(this.$refs.cityJSONFile.files[0]);

        let file = this.$refs.cityJSONFile.files[0];
        if (!file || file.type != "application/json")
        {
          console.log("This is not a JSON file at all!!!");
          return;
        }

        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = evt => {
          cm = JSON.parse(evt.target.result);

          this.citymodel = cm;

          this.file_loaded = true;
        }
      },
      download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      },
      downloadModel() {
        text = JSON.stringify(this.citymodel);

        this.download("citymodel.json", text);
      }
    }
})

Vue.config.devtools = true