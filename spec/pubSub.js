describe('Pub/Sub Tool', function() {

	var ps = pubSub.getInstance();
	var triggered = false;
	var triggerval = "secrets!";
	var triggerFunc = function(data){
		triggered = data;
	};

	it("Can get instance", function () {
		expect(ps).toBeDefined();
	});
	
	it("Two calls to get instance return the same object", function () {
		var _ps = pubSub.getInstance();
		expect(ps).toBe(_ps);
	});
	
	it("Has sub()",function(){
		expect(typeof ps.sub).toBe("function");
	});
	
	it("Has pub()",function(){
		expect(typeof ps.pub).toBe("function");
	});
	
	it("Has unsub()",function(){
		expect(typeof ps.unsub).toBe("function");
	});
	
	it("Can subscribe to 'foo'",function(){
		function foo(){
			ps.sub("foo",triggerFunc);
		}
		expect(foo).not.toThrow();
	});
	
	it("Can publish to 'foo'",function(){
		function foo(){
			ps.pub("foo",triggerval);
		}
		expect(foo).not.toThrow();
	});
	
	it("Got value back from previous subscribe",function(){
		expect(triggered).toBe(triggerval);
	});
	
	it("Again publish to 'foo'",function(){
		function foo(){
			ps.pub("foo",triggerval+triggerval);
		}
		expect(foo).not.toThrow();
	});
	
	it("Again check what we got",function(){
		expect(triggered).toBe(triggerval+triggerval);
	});
	
	it("Unsubscribe from 'foo'",function(){
		function foo(){
			ps.unsub("foo",triggerFunc);
		}
		expect(foo).not.toThrow();
	});
	
	it("Once more publish to 'foo'",function(){
		function foo(){
			ps.pub("foo",triggerval+triggerval+triggerval);
		}
		expect(foo).not.toThrow();
	});
	
	it("But we should not have had anything happen",function(){
		expect(triggered).toBe(triggerval+triggerval);
	});
});