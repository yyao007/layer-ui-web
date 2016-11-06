describe('layer-avatar', function() {
  var el, testRoot, client;
  beforeEach(function() {
    client = new layer.Client({
      appId: 'Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-avatar');
    testRoot.appendChild(el);
    el.enabled = true;
  });
  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  it('Should start without a layer-has-user class', function() {
    expect(el.classList.contains('layer-has-user')).toEqual(false);
  });

  it('Should start with users as empty array', function() {
    expect(el.users).toEqual([]);
  });

  it('Should have a layer-has-user class if one user', function() {
    el.users = [client.user];
    expect(el.classList.contains('layer-has-user')).toEqual(true);
  });

  it('Should have a layer-has-user class if two users', function() {
    el.users = [client.user, client.user];
    expect(el.classList.contains('layer-has-user')).toEqual(true);
  });

  it('Should resume not having a layer-has-user class', function() {
    el.users = [client.user, client.user];
    el.users = [];
    expect(el.classList.contains('layer-has-user')).toEqual(false);
  });

  it("Should generate an img for one user with an avatar", function() {
    client.user.avatarUrl = 'http://abby.normal.frankentein/';
    el.users = [client.user];
    expect(el.childNodes.length).toEqual(1);
    expect(el.firstChild.tagName).toEqual('IMG');
    expect(el.firstChild.src).toEqual(client.user.avatarUrl);
  });

  it("Should generate a span with initials if firstName/lastName", function() {
    client.user.firstName = 'Abby';
    client.user.lastName = 'Normal'
    el.users = [client.user];
    expect(el.childNodes.length).toEqual(1);
    expect(el.firstChild.tagName).toEqual('SPAN');
    expect(el.firstChild.innerHTML).toEqual('AN');
  });

  it("Should generate a span with first two letters of displayName", function() {
    client.user.displayName = 'Abby';
    client.user.lastName = 'Normal'
    el.users = [client.user];
    expect(el.childNodes.length).toEqual(1);
    expect(el.firstChild.tagName).toEqual('SPAN');
    expect(el.firstChild.innerHTML).toEqual('AB');
  });

  it("Should generate multiple spans for multiple users", function() {
    client.user.firstName = 'Abby';
    client.user.lastName = 'Normal'
    el.users = [client.user, client.user];
    expect(el.childNodes.length).toEqual(2);
    expect(el.childNodes[0].tagName).toEqual('SPAN');
    expect(el.childNodes[1].tagName).toEqual('SPAN');
    expect(el.childNodes[0].innerHTML).toEqual('AN');
    expect(el.childNodes[1].innerHTML).toEqual('AN');
  });

  it("Should not set cluster class if one user", function() {
    el.users = [client.user];
    expect(el.classList.contains('layer-avatar-cluster')).toBe(false);
  });

  it("Should set cluster class if multiple users", function() {
    el.users = [client.user, client.user];
    expect(el.classList.contains('layer-avatar-cluster')).toBe(true);
  });
});