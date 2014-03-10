describe("NiceTrie", function() {
  it("can be initialized", function() {
    var t = new NiceTrie();
  });

  describe("with a trie", function(){
    var t;
    beforeEach(function() {
      t = new NiceTrie();
    });

    it("can learn a word", function(){
      t.learn("be");
      var subTrie = t.children.be;
      expect(subTrie).toBeDefined();
      expect(subTrie.isWord).toBe(true);
    });

    it("leaves children on a leaf undefined", function(){
      expect(t.children).toBeUndefined();
    });
    describe(".learn", function(){
      it("learns the whole string as one link initially", function(){
        t.learn("begin");
        expect(t.children.begin).toBeDefined();
      });
      it("splits the links when necessary", function(){
        t.learn("begin");
        t.learn("beast");
        
        var be = t.children.be;
        expect(be).toBeDefined();

        expect(be.children.gin).toBeDefined();
        expect(be.children.gin.isWord).toBeTruthy();

        expect(be.children.ast).toBeDefined();
        expect(be.children.ast.isWord).toBeTruthy();

        expect(t.children.begin).toBeUndefined();
      });

      it("creates extensions correctly", function(){
        t.learn("be");
        t.learn("begin");
        t.learn("beginner");

        var be = t.children.be;
        expect(be).toBeDefined();
        expect(be.isWord).toBeTruthy();

        var begin = be.children.gin;
        expect(begin).toBeDefined();
        expect(begin.isWord).toBeTruthy();
        
        var beginner = begin.children.ner;
        expect(beginner).toBeDefined();
        expect(beginner.isWord).toBeTruthy();
        expect(t.children.beginner).toBeUndefined();
      });

      it("can learn the word constructor", function(){
        t.learn("constructor");
        expect(t.children.constructor.constructor).toEqual(t.constructor);
      });
    });

    describe(".find", function(){
      it("returns null for a nonexistent string", function(){
        expect(t.find("nope")).toEqual(null);
      });
      it("returns the right node for a string", function(){
        t.learn("b");
        var result = t.find("b");
        expect(result.node).toEqual(t.children.b);
        expect(result.path).toEqual("b");
      });
      it("returns the right node for a prefix", function(){
        t.learn("begin");
        t.learn("beginner");
        var result = t.find("b");
        expect(result.node).toEqual(t);
        expect(result.path).toEqual("");
      });
      it("returns the right node for a partial prefix", function(){
        t.learn("begin");
        t.learn("beginner");

        var result = t.find("beginn");
        expect(result).toBeDefined();
        expect(result.node.children.ner).toBeDefined();
        expect(result.path).toEqual("begin");
      });
      it("can find the word constructor", function(){
        t.learn("constructor");
        expect(t.find("constructor").node).toEqual(t.children.constructor);
      });
      it("doesn't imagine the word constructor", function(){
        expect(t.find("constructor")).toBeFalsy();
      });
    });

    describe(".getWords", function(){
      it("gets a child word", function(){
        t.learn("beast");
        expect(t.getWords()).toEqual(["beast"]);
      });
      it("gets multiple child words", function(){
        t.learn("begin");
        t.learn("beginner");
        expect(t.getWords()
          ).toEqual(["begin", "beginner"]);
      });
      it("gets its own node if it is a word", function(){
        t.learn("a");
        expect(t.children.a.getWords()).toEqual([""]);
      });
      it("gets the correct results with many words",function(){
        t.learn("be");
        t.learn("begin");
        t.learn("beginner");
        t.learn("beast");
        expect(t.getWords()).toEqual(["be", "begin", "beginner", "beast"]);
      });
      it("returns an empty array if there are no words", function(){
        expect(t.getWords()).toEqual([]);
      });
      it("can get the word constructor", function(){
        t.learn("constructor");
        expect(t.getWords()).toEqual(["constructor"]);
      });
    });
    describe(".autoComplete", function(){
      beforeEach(function(){
        t.learn("be");
        t.learn("begin");
        t.learn("beginner");
        t.learn("beast");
      });

      it("can recover multiple completions for a prefix", function(){
        expect(t.autoComplete("beg")).toEqual(["begin", "beginner"]);
      });

      it("can recover a single completion", function(){
        expect(t.autoComplete("bea")).toEqual(["beast"]);
      });

      it("can recover a completion for the whole word", function(){
        expect(t.autoComplete("beast")).toEqual(["beast"]);
      });

      it("can recover many completions", function(){
        expect(t.autoComplete("be")).toEqual(["be", "begin", "beginner", "beast"]);
      });
      it("returns an empty array when there are no completions", function(){
        expect(t.autoComplete("a")).toEqual([]);
      });
    });

  });


});