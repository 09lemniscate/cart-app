import React, { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";
import logo from "../assets/1.png";
import defaultProductImage from "../assets/2.png";
import close from "../assets/4.png";

const baseURL = " https://dnc0cmt2n557n.cloudfront.net/products.json";
const PRODUCTS_LIST = "PRODUCTS_LIST";

const App = () => {
  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showCart, setShowCart] = useState(false);

  const setToLocalStorage = (list) => {
    localStorage.setItem(PRODUCTS_LIST, JSON.stringify(list));
  };
  const getFromLocalStorage = () => {
    let pdts = localStorage.getItem(PRODUCTS_LIST);
    let products = [];
    if (pdts) {
      products = JSON.parse(pdts);
    }
    getTotalAmount(products);
    setProducts(products);
  };

  useEffect(() => {
    if (localStorage.getItem(PRODUCTS_LIST) === null) {
      axios.get(baseURL).then((res) => {
        let pdts = res.data.products;
        let amount = 0;
        pdts.forEach((pdt) => {
          pdt["quantity"] = 1;
          pdt["totalPrice"] = pdt["quantity"] * +pdt["price"];
          amount += pdt["totalPrice"];
        });
        setTotalAmount(amount);
        setShowCart(false);
        setToLocalStorage(pdts);
        setProducts(pdts);
      });
    } else {
      getFromLocalStorage();
    }
  }, []);

  const getTotalAmount = (pdts) => {
    let amount = 0;
    pdts.forEach((pdt) => {
      amount = amount + pdt["totalPrice"];
    });
    setTotalAmount(amount);
  };

  const handleIncrementDecrement = (product, index, operator) => {
    if (operator === "-") {
      if (product["quantity"] === 1) {
        return;
      }
      product["quantity"] -= 1;
    } else {
      product["quantity"] += 1;
    }
    product["totalPrice"] = product["quantity"] * +product["price"];
    let newProducts = [...products];
    newProducts[index] = product;
    getTotalAmount(newProducts);
    setToLocalStorage(newProducts);
    setProducts(newProducts);
  };

  const handleRemoveProduct = (index) => {
    let newProducts = [...products];
    newProducts.splice(index, 1);
    if (!newProducts.length) {
      setShowCart(false);
    }
    getTotalAmount(newProducts);
    setToLocalStorage(newProducts);
    setProducts(newProducts);
  };

  const toggleCart = () => {
    setShowCart((showCart) => !showCart);
  };

  const listProducts = () => {
    if (!products.length) {
      return <div className="no-products">No item in cart</div>;
    }
    return products.map((product, index) => {
      let minusBtnClass = "minus-btn";

      if (product.quantity === 1) {
        minusBtnClass = "minus-btn disabled";
      }
      return (
        <div className="item" key={product.id}>
          <div>
            <img className="pdt-img" src={defaultProductImage} alt="cart-logo" />
          </div>
          <div className="description">
            <span>{product.title}</span>
            <span className="fs-11">{product.desc}</span>
          </div>

          <div className="quantity">
            <div className={minusBtnClass} onClick={() => handleIncrementDecrement(product, index, "-")}>
              -
            </div>
            <div className="input-box">{product.quantity}</div>
            <div className="plus-btn" onClick={() => handleIncrementDecrement(product, index, "+")}>
              +
            </div>
          </div>
          <div className="total-price">
            {product.currency}
            {product.totalPrice}
          </div>
        </div>
      );
    });
  };

  const toggleMiniCartContent = () => {
    let content = null;
    if (showCart && products.length) {
      content = products.map((product, index) => {
        return (
          <div className="mini-cart-product" key={product.id}>
            <div className="mini-cart-close" onClick={() => handleRemoveProduct(index)}>
              <img className="img" src={close} alt="cart-logo" />
            </div>
            <div className="description">
              <span>{product.title}</span>
              <span>
                {product.currency}
                {product.price}
              </span>
            </div>
            <div className="mini-cart-qty">Qty {product.quantity}</div>
          </div>
        );
      });
      return <div className="mini-cart">{content}</div>;
    }
    return content;
  };

  return (
    <div className="shopping-cart">
      <div className="cart-header">
        <div onClick={toggleCart}>
          <img className="cart-logo" src={logo} alt="cart-logo" />
        </div>
        <div className="cart-desc">
          <p>$ {totalAmount}</p>
          <p className="wrapper">{products.length} Items</p>
        </div>
        {toggleMiniCartContent()}
      </div>
      {listProducts()}
    </div>
  );
};

export default App;
