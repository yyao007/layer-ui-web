describe('layer-identities-list', function() {
  var el, testRoot, client, query;

  beforeEach(function(done) {

    client = new layer.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-identities-list');
    testRoot.appendChild(el);
    query = client.createQuery({
      model: layer.Query.Identity
    });
    query.isFiring = false;
    query.data = [client.user];
    for (i = 0; i < 100; i++) {
      query.data.push(
        new layer.Identity({
          client: client,
          userId: 'user' + i,
          id: 'layer:///identities/user' + i,
          displayName: 'User ' + i,
          isFullIdentity: true
        })
      );
    }

    el.query = query;
    CustomElements.takeRecords();
    setTimeout(function() {
      done();
    }, 10);
  });

  afterEach(function() {
    try {
      document.body.removeChild(testRoot);
    } catch(e) {}
  });


  describe('Event Handling', function() {
    it("Should call onIdentitySelected when child triggers layer-identity-item-selected", function() {
      var spy = jasmine.createSpy('callback');
      el.onIdentitySelected = spy;
      el.firstChild.trigger('layer-identity-item-selected', {identity: query.data[1]});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });

    it("Should call onIdentityDeselected when child triggers layer-identity-item-deselected", function() {
      var spy = jasmine.createSpy('callback');
      el.selectedIdentities = [query.data[1]];
      el.onIdentityDeselected = spy;
      el.firstChild.trigger('layer-identity-item-deselected', {identity: query.data[1]});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });
  });

  describe("The selectedIdentities property", function() {
    it("Should mark all specified identities as selected", function() {
      el.childNodes[10].selected = true;
      el.childNodes[11].selected = true;
      el.selectedIdentities = [query.data[1], query.data[2]];

      expect(el.childNodes[10].selected).toBe(false);
      expect(el.childNodes[11].selected).toBe(false);
      expect(el.childNodes[1].selected).toBe(true);
      expect(el.childNodes[2].selected).toBe(true);
    });

    it("Should clear all selected identities", function() {
      el.childNodes[10].selected = true;
      el.childNodes[11].selected = true;
      el.selectedIdentities = null;

      expect(el.childNodes[10].selected).toBe(false);
      expect(el.childNodes[11].selected).toBe(false);
    });
  });

  describe("The filter property", function() {
    it("Should call runFilter when set", function() {
      spyOn(el, "runFilter");
      el.filter = "User";
      expect(el.runFilter).toHaveBeenCalledWith();
    });
  });

  describe("The created() method", function() {
    it("Should call updateQuery if there is a queryId passed into the innerHTML", function() {
      testRoot.innerHTML = '<layer-identities-list query-id="' + query.id + '" app-id="' + client.appId + '"></layer-identities-list>';
      CustomElements.takeRecords();
      var el = testRoot.firstChild;
      expect(el.query).toBe(query);
      spyOn(el, "_rerender"); // updateQuery sets up the query listener to call rerender
      query.trigger('change');
      expect(el._rerender).toHaveBeenCalled();
    });

    it("Should call render", function() {
      testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
      CustomElements.takeRecords();
      var el = testRoot.firstChild;
      expect(el.nodes.loadIndicator).toEqual(jasmine.any(HTMLElement));
    });

    it("Should wire up handleIdentitySelect and handleIdentityDeselect", function() {
      var selectSpy = jasmine.createSpy('select');
      var deselectSpy = jasmine.createSpy('deselect');
      el.addEventListener('layer-identity-selected', selectSpy);
      el.addEventListener('layer-identity-deselected', deselectSpy);

      el.firstChild.trigger('layer-identity-item-selected', {identity: query.data[1]});
      expect(selectSpy).toHaveBeenCalled();
      expect(deselectSpy).not.toHaveBeenCalled();
      selectSpy.calls.reset();

      el.selectedIdentities.push(query.data[1]);
      el.firstChild.trigger('layer-identity-item-deselected', {identity: query.data[1]});
      expect(selectSpy).not.toHaveBeenCalled();
      expect(deselectSpy).toHaveBeenCalled();
    });
  });

  describe("The handleIdentitySelect() method", function() {
    it("Should add item to selectedIdentities", function() {
      expect(el.selectedIdentities).toEqual([]);
      el.firstChild.trigger('layer-identity-item-selected', {identity: query.data[1]});
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });

    it("Should call evt.preventDefault if evt.preventDefault and leave selectedIdentities unchanged", function() {
      el.addEventListener('layer-identity-selected', function(evt) {
        expect(evt.preventDefault.calls).toBe(undefined); // Not the spy
        evt.preventDefault();
      });
      var preventDefaultSpy = jasmine.createSpy('preventDefault');
      el.handleIdentitySelect({
        detail: {
          identity: query.data[1]
        },
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: preventDefaultSpy
      });
      expect(preventDefaultSpy).toHaveBeenCalledWith();
      expect(el.selectedIdentities).toEqual([]);
    });

    it("Should do nothing if already in the list", function() {
      el.selectedIdentities = [query.data[1]];
      var spy = jasmine.createSpy('select');
      el.addEventListener('layer-identity-selected', spy);
      el.handleIdentitySelect({
        detail: {
          identity: query.data[1]
        },
        stopPropagation: jasmine.createSpy('stopPropagation')
      });
      expect(spy).not.toHaveBeenCalled();
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });
  });

  describe("The handleIdentityDeselect() method", function() {
    it("Should remove item from selectedIdentities", function() {
      el.selectedIdentities = [query.data[1]];
      el.firstChild.trigger('layer-identity-item-deselected', {identity: query.data[1]});
      expect(el.selectedIdentities).toEqual([]);
    });

    it("Should call evt.preventDefault if evt.preventDefault and leave selectedIdentities unchanged", function() {
      el.selectedIdentities = [query.data[1]];
      el.addEventListener('layer-identity-deselected', function(evt) {
        expect(evt.preventDefault.calls).toBe(undefined); // Not the spy
        evt.preventDefault();
      });
      var preventDefaultSpy = jasmine.createSpy('preventDefault');
      el.handleIdentityDeselect({
        detail: {
          identity: query.data[1]
        },
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: preventDefaultSpy
      });
      expect(preventDefaultSpy).toHaveBeenCalledWith();
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });

    it("Should do nothing if not in the list", function() {
      el.selectedIdentities = [query.data[1]];
      var spy = jasmine.createSpy('deselect');
      el.addEventListener('layer-identity-deselected', spy);
      el.handleIdentityDeselect({
        detail: {
          identity: query.data[2]
        },
        stopPropagation: jasmine.createSpy('stopPropagation')
      });
      expect(spy).not.toHaveBeenCalled();
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });
  });

  describe("The generateItem() method", function() {
    it("Should return a layer-identity-item with an identity setup", function() {
      var result = el.generateItem(query.data[1]);
      expect(result.tagName).toEqual('LAYER-IDENTITY-ITEM');
      expect(result.item).toBe(query.data[1]);
    });

    it("Should set selected state", function() {
      el.selectedIdentities = [query.data[1]];
      var result = el.generateItem(query.data[1]);
      expect(result.selected).toBe(true);

      el.selectedIdentities = [query.data[2]];
      var result = el.generateItem(query.data[1]);
      expect(result.selected).toBe(false);
    });

    it("Should run the filter", function() {
      el.filter = 'Not this again';
      var result = el.generateItem(query.data[1]);
      expect(result.classList.contains('layer-item-filtered')).toBe(true);
    });
  });

  describe("The rerender() method", function() {
    it("Should call _rerender", function() {
      spyOn(el, "_rerender");
      var evt = {};
      el.rerender(evt);
      expect(el._rerender).toHaveBeenCalledWith(evt);
    });

    it("Should remove any removed identities from selectedIdentities", function() {
      el.selectedIdentities = [query.data[2], query.data[1], query.data[0]];
      el.rerender({
        type: 'remove',
        target: query.data[1]
      });
      expect(el.selectedIdentities).toEqual([query.data[2], query.data[0]]);
    });

    it("Should reset selectedIdentities when data is reset", function() {
      el.selectedIdentities = [query.data[2], query.data[1], query.data[0]];
      el.rerender({
        type: 'reset'
      });
      expect(el.selectedIdentities).toEqual([]);
    });
  });

  describe("The renderSelection() method", function() {
    it("Should select and deselect appropriately", function() {
      el.firstChild.selected = true;
      el.childNodes[1].selected = true;
      el.selectedIdentities.pop();
      el.selectedIdentities.pop();
      el.selectedIdentities.push(query.data[5]);
      el.selectedIdentities.push(query.data[6]);

      el.renderSelection();
      expect(el.childNodes[0].innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      expect(el.childNodes[1].innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      expect(el.childNodes[5].innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
      expect(el.childNodes[6].innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
    });
  });

  describe("The runFilter() method", function() {
    it("Should flag all nodes as unfiltered if there is no filter", function() {
      el.childNodes[1].classList.add('layer-item-filtered');
      el.childNodes[2].classList.add('layer-item-filtered');
      el.runFilter('');
      expect(el.querySelectorAllArray('.layer-item-filtered')).toEqual([]);
    });

    it("Should call runFilter on all children", function() {
      el.childNodes[1].classList.add('layer-item-filtered');
      el.childNodes[2].classList.add('layer-item-filtered');
      el.filter = 'User';
      expect(el.querySelectorAllArray('.layer-item-filtered')).toEqual([el.firstChild]);
    });
  });

  describe("Mixin list", function() {
    describe("Properties", function() {
      it("Should set the query given a queryId and then a client", function() {
        var el = document.createElement('layer-identities-list');
        el.queryId = query.id;
        expect(el.client).toBe(null);
        expect(el.query).toBe(null);
        el.appId = client.appId;
        expect(el.client).toBe(client);
        expect(el.query).toBe(query);
      });

      it("Should set the query given a client and then a queryId", function() {
        var el = document.createElement('layer-identities-list');
        el.appId = client.appId;
        expect(el.client).toBe(client);
        expect(el.query).toBe(null);
        el.queryId = query.id;
        expect(el.client).toBe(client);
        expect(el.query).toBe(query);
      });

      it("Should call render on setting the query", function(done) {
        var el = document.createElement('layer-identities-list');
        spyOn(el, "render");
        el.query = query;
        setTimeout(function() {
          expect(el.render).toHaveBeenCalledWith();
          done();
        }, 1)
      });

      // Tests call to _rerender as rerender has already been bound to an event before we can test it
      it("Should wire up rerender on setting the query", function() {
        var el = document.createElement('layer-identities-list');
        spyOn(el, "_rerender");
        el.query = query;
        expect(el._rerender).not.toHaveBeenCalled();
        query.trigger("change", {type: "data", data: []});
        expect(el._rerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
      });

      it("Should add and remove classes on setting isDataLoading", function() {
        expect(el.isDataLoading).toBe(false);
        expect(el.classList.contains('layer-loading-data')).toBe(false);

        el.isDataLoading = true;
        expect(el.classList.contains('layer-loading-data')).toBe(true);

        el.isDataLoading = false;
        expect(el.classList.contains('layer-loading-data')).toBe(false);
      });

      it("Should set onRenderListItem as a string or function", function() {
        el.onRenderListItem = "function(item) {return item.displayName + 'hey ho';}";
        expect(el.onRenderListItem(client.user)).toEqual(client.user.displayName + 'hey ho');

        el.onRenderListItem = function(item) {return item.displayName + 'ho hum';}
        expect(el.onRenderListItem(client.user)).toEqual(client.user.displayName + 'ho hum');
      });


      it("Should destroy the existing query if hasGeneratedQuery is true", function() {
        el.client = client;
        var query2 = client.createQuery({model: layer.Conversation});
        el.query = query2;
        el.props.hasGeneratedQuery = true;
        el.query = query;
        expect(query2.isDestroyed).toBe(true);
        expect(el.props.hasGeneratedQuery).toBe(false);
      });

      it("Should not destroy the existing query if hasGeneratedQuery is false", function() {
        el.client = client;
        var query2 = client.createQuery({model: layer.Conversation});
        el.query = query2;
        el.props.hasGeneratedQuery = false;
        el.query = query;
        expect(query2.isDestroyed).toBe(false);
        expect(el.props.hasGeneratedQuery).toBe(false);
        query2.destroy();
      });
    });

    describe("The created() method", function() {
      it("Should wire up the scroll event handler", function(done) {
        el.props.isSelfScrolling = false;
        spyOn(el, "throttler").and.callFake(function() {
          expect(true).toBe(true);
          done();
        });;
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = 500;
      });

      it("Should initialize listData", function() {
        var el = document.createElement('layer-identities-list');
        expect(el.props.listData).toEqual([]);
      });
    });

    describe("The _onScroll() method", function() {
      it("Should call evt.preventDefault if selfScrolling", function() {
        var evt = {
          preventDefault: jasmine.createSpy('preventDefault')
        };

        el.props.isSelfScrolling = false;
        el._onScroll(evt);
        expect(evt.preventDefault).not.toHaveBeenCalled();

        el.props.isSelfScrolling = true;
        el._onScroll(evt);
        expect(evt.preventDefault).toHaveBeenCalledWith();
      });

      it("Should call throttler with handleScroll if not selfScrolling", function() {
        spyOn(el, "throttler");
        spyOn(el, "handleScroll");
        var evt = {
          preventDefault: jasmine.createSpy('preventDefault')
        };

        el.props.isSelfScrolling = true;
        el._onScroll(evt);
        expect(el.throttler).not.toHaveBeenCalled();

        el.props.isSelfScrolling = false;

        el._onScroll(evt);
        expect(el.throttler).toHaveBeenCalled();
        expect(el.handleScroll).not.toHaveBeenCalled();

        // Find out what function was passed
        el.throttler.calls.allArgs()[0][0]();
        expect(el.handleScroll).toHaveBeenCalled();
      });
    });

    describe("The throttle() method", function() {
      it("Should schedule a call to perform an action", function(done) {
        var spy = jasmine.createSpy("hello");
        el.throttler(spy);
        expect(spy).not.toHaveBeenCalled();
        setTimeout(function() {
          expect(spy).toHaveBeenCalled();
          done();
        }, 100);
      });

      it("Should do nothing if its already scheduled", function() {
        jasmine.clock().install();
        var el = document.createElement('layer-identities-list');
        el.query = query;
        var spy = jasmine.createSpy("hello");
        el.throttler(spy);
        jasmine.clock().tick(50);
        expect(spy).not.toHaveBeenCalled();
        el.throttler(spy);
        el.throttler(spy);
        el.throttler(spy);
        expect(spy).not.toHaveBeenCalled();

        jasmine.clock().tick(50);
        expect(spy.calls.count()).toEqual(1);
        jasmine.clock().tick(5000);
        expect(spy.calls.count()).toEqual(1);
        jasmine.clock().uninstall();
      });
    });

    describe("The handleScroll() method", function() {
      it("Should page the query if near the bottom of the list", function() {
        el.pageSize = 31;
        var initialWindow = query.paginationWindow;
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = el.scrollHeight - el.clientHeight;
        spyOn(query, "update");
        el.handleScroll();
        expect(query.update).toHaveBeenCalledWith({paginationWindow: initialWindow + 31});
      });

      it("Should set isDataLoading if the query is firing after updating pagination", function() {
        el.style.height = "100px";
        el.style.overflow = "auto";
        expect(el.isDataLoading).toBe(false);
        el.scrollTop = el.scrollHeight - el.clientHeight;
        query.isFiring = true;
        el.handleScroll();
        expect(el.isDataLoading).toBe(true);

      });

      it("Should not page the query if far from the bottom of the list", function() {
        el.pageSize = 31;
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = 20;
        spyOn(query, "update");
        el.handleScroll();
        expect(query.update).not.toHaveBeenCalled();
      });
    });

    describe("The render() method", function() {
      it("Should set the loadIndicator to an element in the widget", function() {
        el.nodes.loadIndicator = null;
        el.render();
        expect(el.nodes.loadIndicator.classList.contains('layer-load-indicator')).toBe(true);
      });

      it("Should call rerender if there is query data", function() {
        spyOn(el, 'rerender');
        el.render();
        expect(el.rerender).toHaveBeenCalledWith({type: 'data', data: query.data});
        el.rerender.calls.reset();

        query.data = [];
        el.render();
        expect(el.rerender).not.toHaveBeenCalled();
      });
    });

    describe("The generateFragment() method", function() {
      it("Should generate a fragment if needed", function() {
        expect(el.generateFragment([client.user])).toEqual(jasmine.any(DocumentFragment));
      });

      it("Should use the provided fragment", function() {
        var fragment = document.createDocumentFragment();
        expect(el.generateFragment([client.user], fragment)).toBe(fragment);
        expect(fragment.childNodes.length > 0).toBe(true);
      });

      it("Should call generateFragmentItem for each data result", function() {
        spyOn(el, "generateFragmentItem");
        el.generateFragment(query.data);
        expect(el.generateFragmentItem.calls.count()).toEqual(query.data.length);
        expect(el.generateFragmentItem).toHaveBeenCalledWith(query.data[23], jasmine.any(DocumentFragment));
      });
    });

    describe("The generateFragmentItem() method", function() {
      it("Should create a widget via generateItem and add it to the fragment", function() {
        spyOn(el, "generateItem").and.callThrough();
        var fragment = document.createDocumentFragment();
        el.generateFragmentItem(client.user, fragment);
        expect(el.generateItem).toHaveBeenCalledWith(client.user);
        expect(fragment.childNodes[0].tagName).toEqual('LAYER-IDENTITY-ITEM');
        expect(fragment.childNodes[0].item).toBe(client.user);
      });

      it("Should create a widget by ID via generateItem and add it to the fragment", function() {
        spyOn(el, "generateItem").and.callThrough();
        var fragment = document.createDocumentFragment();
        el.generateFragmentItem({id: client.user.id}, fragment);
        expect(el.generateItem).toHaveBeenCalledWith(client.user);
        expect(fragment.childNodes[0].tagName).toEqual('LAYER-IDENTITY-ITEM');
        expect(fragment.childNodes[0].item).toBe(client.user);
      });

      it("Should do nothing if item not found", function() {
        spyOn(el, "generateItem").and.callThrough();
        var fragment = document.createDocumentFragment();
        el.generateFragmentItem({id: client.user.id + 'a'}, fragment);
        expect(el.generateItem).not.toHaveBeenCalled();
        expect(fragment.childNodes.length).toEqual(0);
      });

      it("Should set listHeight/listWidth of the item", function() {
        var fragment = document.createDocumentFragment();
        el.generateFragmentItem(client.user, fragment);
        var item = fragment.childNodes[0];
        expect(item.props.listHeight).toEqual(el.clientHeight);
        expect(item.props.listWidth).toEqual(el.clientWidth);
        expect(el.clientHeight > 0).toBe(true);
        expect(el.clientWidth > 0).toBe(true);
      });
    });

    describe("The _gatherAndProcessAffectedItems() method", function() {
      beforeEach(function() {
        el.render();
      });

      it("Should find all matching items and call processAffectedWidgets on them", function() {
        spyOn(el, "processAffectedWidgets");
        el._gatherAndProcessAffectedItems([query.data[5], query.data[10]], false);
        expect(el.processAffectedWidgets).toHaveBeenCalledWith([el.childNodes[5], el.childNodes[10]], false);
      });
    });

    describe("The processAffectedWidgets() method", function() {
      beforeEach(function() {
        el.render();
      });

      it("Should call _processAffectedWidgets with the correct firstIndex", function() {
        spyOn(el, "_processAffectedWidgets");
        el.processAffectedWidgets([el.childNodes[5], el.childNodes[10]], false);
        expect(el._processAffectedWidgets).toHaveBeenCalledWith([el.childNodes[5], el.childNodes[10]], 5, false);
      });

      it("Should call onRenderListItem on each item", function() {
        el.onRenderListItem = jasmine.createSpy('renderItem');
        el.processAffectedWidgets([el.childNodes[5], el.childNodes[10]], false);
        expect(el.onRenderListItem.calls.count()).toBe(2);
        expect(el.onRenderListItem).toHaveBeenCalledWith(el.childNodes[5], el.props.listData, 5, false);
        expect(el.onRenderListItem).toHaveBeenCalledWith(el.childNodes[10], el.props.listData, 6, false);
      });
    });

    describe("The _rerender() method", function() {
      beforeEach(function() {
        spyOn(el, "renderPagedData");
        spyOn(el, "renderInsertedData");
        spyOn(el, "renderWithoutRemovedData");
        spyOn(el, "renderResetData");
        spyOn(el, "renderMovedData");
      });
      it("Should only call renderPagedData for data event", function() {
        var evt = {type: 'data'};
        el._rerender(evt);
        expect(el.renderPagedData).toHaveBeenCalledWith(evt);
        expect(el.renderInsertedData).not.toHaveBeenCalled();
        expect(el.renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el.renderResetData).not.toHaveBeenCalled();
        expect(el.renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call renderInsertedData for insert event", function() {
        var evt = {type: 'insert'};
        el._rerender(evt);
        expect(el.renderInsertedData).toHaveBeenCalledWith(evt);
        expect(el.renderPagedData).not.toHaveBeenCalled();
        expect(el.renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el.renderResetData).not.toHaveBeenCalled();
        expect(el.renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call renderWithoutRemovedData for remove event", function() {
        var evt = {type: 'remove'};
        el._rerender(evt);
        expect(el.renderWithoutRemovedData).toHaveBeenCalledWith(evt);
        expect(el.renderPagedData).not.toHaveBeenCalled();
        expect(el.renderInsertedData).not.toHaveBeenCalled();
        expect(el.renderResetData).not.toHaveBeenCalled();
        expect(el.renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call renderResetData for reset event", function() {
        var evt = {type: 'reset'};
        el._rerender(evt);
        expect(el.renderResetData).toHaveBeenCalledWith();
        expect(el.renderPagedData).not.toHaveBeenCalled();
        expect(el.renderInsertedData).not.toHaveBeenCalled();
        expect(el.renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el.renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call renderMovedData for move event", function() {
        var evt = {type: 'move'};
        el._rerender(evt);
        expect(el.renderResetData).not.toHaveBeenCalledWith();
        expect(el.renderPagedData).not.toHaveBeenCalled();
        expect(el.renderInsertedData).not.toHaveBeenCalled();
        expect(el.renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el.renderMovedData).toHaveBeenCalledWith(evt);
      });
    });

    describe("The renderResetData() method", function() {
      it("Should reset listData", function() {
        el.props.listData = query.data;
        query.reset();
        expect(el.props.listData.length).toEqual(0);
        expect(query.data).not.toBe(el.props.listData);
      });

      it("Should reset the scroll position", function() {
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = 100;
        expect(el.scrollTop > 0).toBe(true);
        query.reset();
        expect(el.scrollTop > 0).toBe(false);
      });

      it("Should empty the list of items, but still contain a loadingIndicator node", function() {
        el.render();
        expect(el.childNodes.length > 1).toBe(true);
        query.reset();
        expect(el.childNodes.length > 1).toBe(false);
        expect(el.firstChild.classList.contains('layer-load-indicator')).toBe(true);
      });
    });


    describe("The renderWithoutRemovedData() method", function() {
      it("Should update listData", function(done) {
        el.render();
        var initialLength = query.data.length;
        expect(initialLength).toEqual(el.props.listData.length);
        expect(el.props.listData).toEqual(query.data);
        expect(el.props.listData).not.toBe(query.data);
        spyOn(el, 'renderWithoutRemovedData').and.callThrough();

        // Run
        query.data[5].destroy();
        setTimeout(function() {
          expect(el.renderWithoutRemovedData).toHaveBeenCalled();

          // Posttest
          expect(el.props.listData).toEqual(query.data);
          expect(el.props.listData).not.toBe(query.data);
          expect(initialLength).toEqual(el.props.listData.length + 1);
          done();
        }, 10);
      });

      it("Should call _gatherAndProcessAffectedItems with 3 items before and 3 after the removed item", function(done) {
        spyOn(el, "_gatherAndProcessAffectedItems");

        // Run
        query.data[5].destroy();
        setTimeout(function() {

          // Posttest
          expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
            query.data[2],
            query.data[3],
            query.data[4],
            query.data[5],
            query.data[6],
            query.data[7]], false);
          done();
        });
      });

      it("Should remove the item from the list", function(done) {
        el.render();
        var displayName = ">" + query.data[5].displayName + "<";
        expect(el.innerHTML.indexOf(displayName)).not.toEqual(-1);

        // Run
        query.data[5].destroy();

        setTimeout(function() {
          // Posttest
          expect(el.innerHTML.indexOf(displayName)).toEqual(-1);
          done();
        }, 10);
      });
    });

    describe("The renderInsertedData() method", function() {
      it("Should update listData", function() {
        query._handleIdentityAddEvent({
          identities: [
            new layer.Identity({
              client: client,
              userId: 'user' + 10000,
              id: 'layer:///identities/user' + 10000,
              displayName: 'User ' + 10000,
              isFullIdentity: true
            })
          ]
        });

        // Posttest
        expect(el.props.listData[el.props.listData.length - 1]).toBe(client.getIdentity('layer:///identities/user' + 10000));
      });

      it("Should insert a list item at the proper index", function() {
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });
        query.data.splice(50, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 50,
          target: identity,
          query: query
        });

        // Posttest
        var newElement = el.querySelector('#' + el.getItemId(identity));
        expect(newElement.item.userId).toEqual("user10000");
        expect(newElement).toBe(el.childNodes[50]);
      });

      it("Should call _gatherAndProcessAffectedItems on 3 items before and 3 items after the inserted item", function() {
        spyOn(el, "_gatherAndProcessAffectedItems");
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });

        // Run
        query.data.splice(50, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 50,
          target: identity,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
          query.data[50-3],
          query.data[50-2],
          query.data[50-1],
          query.data[50],
          query.data[50+1],
          query.data[50+2],
          query.data[50+3]
        ], false);
      });

      it("Should call _gatherAndProcessAffectedItems with isTopNewItem as false if index > 0", function() {
        spyOn(el, "_gatherAndProcessAffectedItems");
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });

        // Run
        query.data.splice(50, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 50,
          target: identity,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
          query.data[50-3],
          query.data[50-2],
          query.data[50-1],
          query.data[50],
          query.data[50+1],
          query.data[50+2],
          query.data[50+3]
        ], false);
      });

      it("Should call _gatherAndProcessAffectedItems with isTopNewItem as true if index === 0", function() {
        spyOn(el, "_gatherAndProcessAffectedItems");
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });

        // Run
        query.data.splice(0, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 0,
          target: identity,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
          query.data[0],
          query.data[1],
          query.data[2],
          query.data[3]
        ], true);
      });
    });

    describe("The renderPagedData() method", function() {
      it("Should update listData", function() {
        spyOn(el, "renderPagedData").and.callThrough();
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];

        // Run
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el.renderPagedData).toHaveBeenCalled();
        expect(el.props.listData[el.props.listData.length - 2].displayName).toEqual("User 10000");
        expect(el.props.listData[el.props.listData.length - 1].displayName).toEqual("User 10001");
      });

      it("Should append all new items just before the loadIndicator", function() {
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];

        // Run
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el.childNodes[el.childNodes.length - 1]).toBe(el.nodes.loadIndicator);
        expect(el.childNodes[el.childNodes.length - 2].item.displayName).toEqual("User 10001");
      });

      it("Should call _gatherAndProcessAffectedItems on all of the newly added items, plus the prior last 3 items", function() {
        var last3Items = query.data.slice(query.data.length-3, query.data.length);
        expect(last3Items.length).toEqual(3);
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];
        spyOn(el, "_gatherAndProcessAffectedItems");

        // Run
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith(last3Items.concat(identities), false);

      });

      it("Should update isDataLoading to match the query firing state, triggering all side effects", function() {
        var last3Items = query.data.slice(query.data.length-3, query.data.length);
        expect(last3Items.length).toEqual(3);
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];
        spyOn(el, "_gatherAndProcessAffectedItems");

        // Run 1
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query.isFiring = true;
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el.isDataLoading).toBe(true);

        // Run 2
        query.isFiring = false;
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest 2
        expect(el.isDataLoading).toBe(false);
      });
    });

    describe("The renderMovedData() method", function() {
      it("Should move the element to the start of the list", function() {
        expect(el.childNodes[3].item).toBe(query.data[3]);

        el.renderMovedData({
          target: query.data[3],
          fromIndex: 3,
          toIndex: 0
        });
        expect(el.childNodes[0].item).toBe(query.data[3]);
        expect(el.childNodes[3].item).toBe(query.data[2]);
        expect(el.childNodes[4].item).toBe(query.data[4]);
      });

      it("Should move the element to the end of the list", function() {
        el.renderMovedData({
          target: query.data[3],
          fromIndex: 3,
          toIndex: query.data.length - 1
        });
        expect(el.childNodes[query.data.length - 1].item).toBe(query.data[3]);
        expect(el.childNodes[3].item).toBe(query.data[4]);
        expect(el.childNodes[4].item).toBe(query.data[5]);
      });

      it("Should move the element to the middle of the list", function() {
        el.renderMovedData({
          target: query.data[3],
          fromIndex: 3,
          toIndex: 50
        });
        expect(el.childNodes[50].item).toBe(query.data[3]);
        expect(el.childNodes[3].item).toBe(query.data[4]);
        expect(el.childNodes[4].item).toBe(query.data[5]);
      });
    })
  });

  describe("Mixin main-component", function() {
    describe("Common Properties", function() {
      it("Should setup the client from the appId property", function() {
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        expect(el.client).toBe(null);
        el.appId = client.appId;
        expect(el.client).toBe(client);
      });

      it("Should setup the client from the app-id attribute", function() {
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        expect(el.client).toBe(client);
      });

      it("Should setup the client from the layerUI.appId property", function() {
        layerUI.appId = client.appId;
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        expect(el.client).toBe(client);
        layerUI.appId = null;
      });

      it("Should call scheduleGeneratedQuery once the client is set", function() {
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        spyOn(el, "scheduleGeneratedQuery");
        el.client = client;
        expect(el.scheduleGeneratedQuery).toHaveBeenCalledWith();
      });
    });

    describe("The created() method", function() {
      beforeEach(function() {
        jasmine.clock().install();
      });

      afterEach(function() {
        jasmine.clock().uninstall();
      });
    });


    describe("The setupGeneratedQuery() method", function() {
      it("Should create a query if this.queryModel && !this.query && this.client", function() {
        // Main test
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.setupGeneratedQuery();
        expect(el.query).toEqual(jasmine.any(layer.Query));
        expect(el.query.model).toEqual(layer.Query.Identity);

        // Alt test 1
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.queryModel = '';
        el.setupGeneratedQuery();
        expect(el.query).toBe(null);

        // Alt test 2
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.setupGeneratedQuery();
        expect(el.query).toBe(null);
        layerUI.appId = tmp;

        // Alt test 3
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.query = query;
        el.setupGeneratedQuery();
        expect(el.query).toBe(query);
      });

      it("Should set hasGeneratedQuery if the query was set", function() {
        // Main test
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(true);

        // Alt test 1
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.queryModel = '';
        el.setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);

        // Alt test 2
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
        layerUI.appId = tmp;

        // Alt test 3
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.query = query;
        el.setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
      });
    });
  });
});