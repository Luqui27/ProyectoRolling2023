import React, { useState, useEffect } from "react";
import "./MiCarritoTabla.css";
import Tarjetas from "../Tarjetas/Tarjetas";
import { Link, useNavigate } from "react-router-dom";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";

const obtenerIdUsuarioDesdeCookies = () => {
  const cookies = document.cookie.split("; ");
  const cookieId = cookies.find((cookie) => cookie.startsWith("_id"));
  return cookieId ? cookieId.split("=")[1] : null;
};

const MiCarritoTabla = () => {
  const [pedidoMiCarrito, setPedidoMiCarrito] = useState([]);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [eliminandoProductoId, setEliminandoProductoId] = useState(null);
  const [obteniendoCarrito, setObteniendoCarrito] = useState(true);
  const [realizandoCompra, setRealizandoCompra] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [creditCardDetails, setCreditCardDetails] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    name:"",
  });
  const [creditCardFocus, setCreditCardFocus] = useState(""); // Nuevo estado para el enfoque

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleCreditCardDetailsChange = (field, value) => {
    setCreditCardDetails({
      ...creditCardDetails,
      [field]: value,
    });
  };

  const isCreditCardEmpty =
    paymentMethod === "tarjeta" &&
    (Object.values(creditCardDetails).some((value) => !value.trim()) ||
      Object.keys(creditCardDetails).length !== 4);

  const isCreditCardValid =
    paymentMethod === "tarjeta" &&
    /^[0-9]{16}$/.test(creditCardDetails.cardNumber) &&
    /^[0-9]{4}$/.test(creditCardDetails.expirationDate) &&
    /^[0-9]{3,4}$/.test(creditCardDetails.cvv);

  const isFormEmpty =
    pedidoMiCarrito.length === 0 ||
    (paymentMethod === "tarjeta" && isCreditCardEmpty);
  const isFormValid = paymentMethod === "tarjeta" ? isCreditCardValid : true;

  const confirmPurchase = () => {
    const isConfirmed = window.confirm("¿Estás seguro de realizar la compra?");

    if (isConfirmed) {
      if (paymentMethod === "tarjeta" && isCreditCardEmpty) {
        alert("Por favor, completa los datos de la tarjeta correctamente.");
      } else if (paymentMethod === "tarjeta" && !isCreditCardValid) {
        alert("Por favor, completa los datos de la tarjeta correctamente.");
      } else {
        realizarCompra();
      }
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const userId = obtenerIdUsuarioDesdeCookies();

    if (!userId) {
      console.error("ID de usuario no encontrado en las cookies.");
      navigate("/acceso");
      return;
    }

    setObteniendoCarrito(true);

    fetch(`https://restaurantedb.onrender.com/api/carrito/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setPedidoMiCarrito(data.carrito.productos);
        setPrecioTotal(data.carrito.total);
      })
      .catch((error) => {
        console.error("Error fetching cart items:", error);
      })
      .finally(() => {
        setObteniendoCarrito(false);
      });
  }, []);

  const actualizarCantidadEnServidor = async (idProducto, nuevaCantidad) => {
    const userId = obtenerIdUsuarioDesdeCookies();

    if (!userId) {
      console.error("ID de usuario no encontrado en las cookies.");
      return;
    }

    fetch(
      `https://restaurantedb.onrender.com/api/carrito/actualizar-cantidad/${userId}/${idProducto}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nuevaCantidad }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setPedidoMiCarrito(data.carrito.productos);
        setPrecioTotal(data.carrito.total);
      })
      .catch((error) => {
        console.error("Error updating item quantity:", error);
      });
  };

  const disminuirProducto = (idProducto) => {
    const producto = pedidoMiCarrito.find(
      (producto) => producto.menu === idProducto
    );
    if (producto) {
      actualizarCantidadEnServidor(
        idProducto,
        Math.max(producto.cantidad - 1, 0)
      );
    }
  };

  const agregarProducto = (idProducto) => {
    const producto = pedidoMiCarrito.find(
      (producto) => producto.menu === idProducto
    );
    if (producto) {
      actualizarCantidadEnServidor(idProducto, producto.cantidad + 1);
    }
  };

  const eliminarMenu = (idProducto) => {
    const userId = obtenerIdUsuarioDesdeCookies();

    if (!userId) {
      console.error("ID de usuario no encontrado en las cookies.");
      return;
    }

    setEliminandoProductoId(idProducto);

    fetch(
      `https://restaurantedb.onrender.com/api/carrito/eliminar/${userId}/${idProducto}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setPedidoMiCarrito(data.carrito.productos);
        setPrecioTotal(data.carrito.total);
      })
      .catch((error) => {
        console.error("Error deleting cart item:", error);
      })
      .finally(() => {
        setEliminandoProductoId(null);
      });
  };

  const realizarCompra = async () => {
    try {
      setRealizandoCompra(true);

      const userId = obtenerIdUsuarioDesdeCookies();

      if (!userId) {
        console.error("ID de usuario no encontrado en las cookies.");
        return;
      }

      const fechaActual = new Date();
      const pedido = {
        usuario: userId,
        fecha: fechaActual,
        productos: pedidoMiCarrito.map((producto) => ({
          menu: producto.menu,
          nombre: producto.nombre,
          cantidad: producto.cantidad,
        })),
      };

      // Enviar los datos al servidor
      const response = await fetch(
        "https://restaurantedb.onrender.com/api/pedidos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedido),
        }
      );

      if (response.ok) {
        // Limpiar el carrito después de la compra exitosa
        setPedidoMiCarrito([]);
        setPrecioTotal(0);
        alert("Compra realizada con éxito");
      } else {
        console.error("Error al realizar la compra:", response.statusText);
        alert("Error al realizar la compra. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al realizar la compra:", error);
      alert("Error al realizar la compra. Inténtalo de nuevo.");
    } finally {
      setRealizandoCompra(false);
    }
  };

  return obteniendoCarrito ? (
    <div className="d-flex justify-content-center">
      <div className="spinner-border" role="status">
        <span className="sr-only"></span>
      </div>
    </div>
  ) : pedidoMiCarrito.length > 0 ? (
    <>
      <div>
        <h1 className="tituloCarrito">Mi Carrito</h1>
      </div>
      <div className="container">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">NOMBRE</th>

                <th scope="col">PRECIO UNITARIO</th>
                <th scope="col">CANTIDAD</th>
                <th scope="col">ELIMINAR</th>
                <th scope="col">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {pedidoMiCarrito.map((producto) => (
                <tr key={producto.menu}>
                  <th>{producto.nombre}</th>

                  <td>{`$${producto.precio}`}</td>
                  <td>
                    <button
                      className="botonDisminuir"
                      onClick={() => disminuirProducto(producto.menu)}
                    >
                      -
                    </button>
                    {producto.cantidad}
                    <button
                      className="botonAgregar"
                      onClick={() => agregarProducto(producto.menu)}
                    >
                      +
                    </button>
                  </td>
                  <td>
                    <button
                      className="botonEliminar"
                      onClick={() => eliminarMenu(producto.menu)}
                      disabled={eliminandoProductoId === producto.menu}
                    >
                      {eliminandoProductoId === producto.menu ? (
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="sr-only"></span>
                        </div>
                      ) : (
                        "Eliminar"
                      )}
                    </button>
                  </td>
                  <td>{`$${producto.cantidad * producto.precio}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="tituloCarrito">
        Total a pagar: $ {precioTotal.toLocaleString()}
      </h2>
      <div className="opciones-pago">
        <h2 className="tituloCarrito">Opciones de Pago</h2>
        <div className="centrar-radios">
          <label className="m-2">
            <input
              type="radio"
              value="efectivo"
              checked={paymentMethod === "efectivo"}
              onChange={() => handlePaymentMethodChange("efectivo")}
            />
            Efectivo
          </label>
          <label className="m-2">
            <input
              type="radio"
              value="tarjeta"
              checked={paymentMethod === "tarjeta"}
              onChange={() => handlePaymentMethodChange("tarjeta")}
            />
            Tarjeta
          </label>
        </div>

        {paymentMethod === "tarjeta" && (
          <div className="container">
            <div className="formulario-tarjeta col-lg-6 mx-auto">
              <div>
                <Cards
                  cvc={creditCardDetails.cvv}
                  expiry={creditCardDetails.expirationDate}
                  focused={creditCardFocus}
                  name={creditCardDetails.name}
                  number={creditCardDetails.cardNumber}
                />
                <label>
                  <input
                    type="text"
                    value={creditCardDetails.cardNumber}
                    maxLength={16}
                    onChange={(e) =>
                      handleCreditCardDetailsChange(
                        "cardNumber",
                        e.target.value
                      )
                      
                    }
                    onFocus={() => setCreditCardFocus("number")}
                    placeholder="Numero de Tarjeta"
                  />
                </label>
                <label>
                  <input
                    type="text"
                    value={creditCardDetails.expirationDate}
                    maxLength={4}
                    onChange={(e) =>
                      handleCreditCardDetailsChange(
                        "expirationDate",
                        e.target.value
                      )
                    }
                    onFocus={() => setCreditCardFocus("expiry")}
                    placeholder="Vencimiento MMAA"
                  />
                </label>
                <label>
                  <input
                    type="text"
                    value={creditCardDetails.cvv}
                    maxLength={4}
                    onChange={(e) =>
                      handleCreditCardDetailsChange("cvv", e.target.value)
                    }
                    onFocus={() => setCreditCardFocus("cvc")}
                    placeholder="CVV"
                  />
                </label>
                <label>
                  <input
                    type="text"
                    value={creditCardDetails.name}
                    maxLength={50}
                    onChange={(e) =>
                      handleCreditCardDetailsChange("name", e.target.value)
                    }
                    onFocus={() => setCreditCardFocus("name")}
                    placeholder="Nombre Titular"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Fin de la nueva sección */}
      <div className="text-center mb-4">
        <button
          className="btn btn-warning m-2"
          onClick={confirmPurchase}
          disabled={realizandoCompra || isFormEmpty}
        >
          {realizandoCompra ? "Realizando compra..." : "Comprar"}
        </button>
      </div>
    </>
  ) : (
    <>
      <h2 className="tituloCarrito">El carrito está vacío</h2>
      <div className="text-center mb-4">
        <Link to="/tarjetas" className="btn btn-success">
          Ir a elegir menú
        </Link>
      </div>
    </>
  );
};

export default MiCarritoTabla;
