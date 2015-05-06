/**
 * The CDF data schema. This class instructs CDF controls how to extract data from their CDF data sources.
 * <p/>
 * CDF is a flexible nested XML data structure. The default CDF schema looks like:
 * <pre>
 * &lt;data jsxid="jsxroot"&gt;
 *   &lt;record jsxid="id1" jsxtext="label1" .../&gt;
 *   ...
 * &lt;/data&gt;
 * </pre>
 *
 * The required aspects of CDF are:
 * <ul>
 *   <li>A simple XML structure with one XML element per item</li>
 *   <li>Child items are direct descendants of their parent item</li>
 *   <li>A unique ID per-item</li>
 *   <li>(In some cases) id="jsxroot" on the root element</li>
 * </ul>
 *
 * Other aspects of the schema are flexible so that you could have CDF that looks like:
 * <pre>
 * &lt;items id="jsxroot"&gt;
 *   &lt;item id="id1" label="label1" .../&gt;
 *   ...
 * &lt;/items&gt;
 * </pre>
 *
 * This schema is achieved by an instance of this class with the following properties:
 * <code>children</code> = "item", <code>id</code> = "id" and <code>text</code> = "label".
 *
 * @see jsx3.xml.CDF#setSchema()
 * @since 3.9
 */
jsx3.Class.defineClass("jsx3.xml.CDFSchema", jsx3.app.Model, null, function(Schema, Schema_prototype) {

  Schema_prototype.init = function(o) {
    if (o)
      for (var f in o)
        this.setProp(f, o[f]);
  };

  Schema_prototype.assembleFromXML = function(objElm) {
    var names = objElm.getAttributeNames();
    var props = this.getProps();

    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (name == "type")
        continue;
      else if (name == "jsxname")
        this.jsxname = objElm.getAttribute(name);
      else
        props[name.substring(1)] = objElm.getAttribute(name);
    }
  };

  Schema_prototype.toXMLElm = function(objXML, objProperties) {
    var objNode = objXML.createNode(Entity.TYPEELEMENT, "object", objXML.getNamespaceURI());
    var props = this.getProps();

    objNode.setAttribute("type", this.getClass().getName());
    if (this.getName())
      objNode.setAttribute("jsxname", this.getName());

    for (var f in props)
      if (props[f])
        objNode.setAttribute("a" + f, props[f]);

    return objNode;
  };

  /**
   * Returns all the set properties of this schema.
   * @return {Object<String, String>}
   */
  Schema_prototype.getProps = function() {
    if (!this._jsxp)
      this._jsxp = {};
    return this._jsxp;
  };

  /**
   * Returns a property of this schema or the default property value.
   * @param name {String} the property key.
   * @return {String} the set property value or the default value.
   */
  Schema_prototype.getProp = function(name) {
    return this.getProps()[name] || (name == "children" ? "record" : "jsx" + name);
  };

  /**
   * Sets or clears a property of this schema. The relevant values for <code>name</code> depend on the subclass of
   * <code>jsx3.xml.CDF</code> that this schema will apply to. The following properties apply in most cases:
   * <ul>
   *   <li><code>children</code></li>
   *   <li><code>id</code></li>
   *   <li><code>text</code></li>
   *   <li><code>tip</code></li>
   *   <li><code>style</code></li>
   *   <li><code>class</code></li>
   *   <li><code>img</code></li>
   *   <li><code>imgalt</code></li>
   * </ul>
   * Others include <code>selected</code>, <code>unselectable</code>, <code>divider</code>, <code>disabled</code>,
   * <code>keycode</code> and <code>open</code>.
   *
   * @param name {String}
   * @param value {String}
   */
  Schema_prototype.setProp = function(name, value) {
    this.getProps()[name] = value;
  };

});
