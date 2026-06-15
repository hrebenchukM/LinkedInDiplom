// import { useEffect, useState ,useContext} from "react";
// import { useParams } from "react-router-dom";
// import { Link } from "react-router-dom";
// import AppContext from "../../features/appContext/AppContext";
// import "./Product.css";

// export default function Product() {
//  const {slug} = useParams();
//  const [product, setProduct] = useState({price :0 });//products: [] 
//  const {cart,request,addToCart } = useContext(AppContext);
//  const StarRating = ({ value }) => {
//         const stars = [];

//         for (let i = 1; i <= 5; i++) {
//             const fill = Math.min(Math.max(value - (i - 1), 0), 1) * 100;

//             stars.push(
//                 <div key={i} className="star-wrap">
//                     <div className="star-base">★</div>
//                     <div className="star-fill" style={{ width: fill + "%" }}>★</div>
//                 </div>
//             );
//         }

//         return (
//             <div className="d-flex align-items-center">
//                 {stars}
//                 <span className="ms-2">{value.toFixed(2)}</span>
//             </div>
//         );
//     };
//     useEffect(() => {
//         request("api://product/" + slug)
//         .then(setProduct);
    
//     }, []);


//  const avgStars = product.rates && product.rates.length > 0
//         ? product.rates.reduce((s, r) => s + r.rateStars, 0) / product.rates.length
//         : 0;

//      const addToCartClick = (e) => {
//     e.preventDefault();
//     addToCart(product);
// };



//  return (
//   <>
//     <h1>Сторінка товару {product.name}</h1>

//     <div className="row">
//       <div className="col col-4">
//         <img className="w-100" src={product.imageUrl} alt={product.name} />
//       </div>

//       <div className="col col-6">
//         <h3>{product.name}</h3>
//         <p>{product.description}</p>
//         <strong>{product.price?.toFixed(2)} ₴</strong>
//         <div className="mt-2">
//             <StarRating value={avgStars} />
//         </div>

//       </div>
//     <div className="col col-12 col-md-2 d-flex align-items-start">
// {cart.cartItems.some(ci => ci.productId === product.id)
//     ? (
//         <Link to="/cart" className="btn btn-success">
//             <i className="bi bi-cart-check"></i>
//         </Link>
//       )
//     : (
//         <button onClick={addToCartClick} className="btn btn-outline-success">
//             <i className="bi bi-cart-plus"></i>
//         </button>
//       )
// }

//     </div>

// <div className="col col-2">
//     <div className="border p-2 mt-2">Місце здається під рекламу</div>
//      <RatePaginator initialRates={product.rates} productId={product.id} />
// </div>

//     </div>



    
// {product.relativeProducts?.length > 0 && (
//   <>
//     <h4>Подібні товари</h4>
//     <div className="row">
//       {product.relativeProducts.map((p) => (
//         <div key={p.id} className="col-6 col-md-3 mb-3">
//           <Link to={`/product/${p.slug}`} className="card p-2 text-center text-decoration-none text-dark">
//             <img 
//               src={p.imageUrl} 
//               className="w-100 mb-2" 
//               alt={p.name} 
//               style={{objectFit: 'cover'}}
//             />
//             <div>{p.name}</div>
//             <div className="fw-bold">{p.price?.toFixed(2)} ₴</div>
//           </Link>
//         </div>
//       ))}
//     </div>
//   </>
// )}


//         </>
//     );
// }
// function RatePaginator({ productId }) {
//     const { request } = useContext(AppContext);

//     const [rates, setRates] = useState([]);
//     const [isExpanded, setIsExpanded] = useState(false);

//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         lastPage: 1,
//         perPage: 2,
//         totalItems: 0
//     });

//     const loadRates = (page = 1, perPage = 2) => {
//         const url = `api://rate/${productId}?page=${page}&perpage=${perPage}`;

//         request(url, {}, true).then(r => {
//             setRates(r.data || []);
//             if (r.meta?.pagination) {
//                 setPagination(r.meta.pagination);
//             }
//         });
//     };

//     // при смене товара
//     useEffect(() => {
//         if (productId) {
//             setIsExpanded(false);
//             loadRates(1, 2);
//         }
//     }, [productId]);

//     const toggleView = (e) => {
//         e.preventDefault();

//         if (!isExpanded) {
//             loadRates(1, pagination.totalItems || 100);
//         } else {
//             loadRates(1, 2);
//         }

//         setIsExpanded(prev => !prev);
//     };

//     const prevPage = (e) => {
//         e.preventDefault();
//         if (pagination.currentPage > 1) {
//             loadRates(pagination.currentPage - 1, pagination.perPage);
//         }
//     };

//     const nextPage = (e) => {
//         e.preventDefault();
//         if (pagination.currentPage < pagination.lastPage) {
//             loadRates(pagination.currentPage + 1, pagination.perPage);
//         }
//     };

//     const goToPage = (e, page) => {
//         e.preventDefault();
//         loadRates(page, pagination.perPage);
//     };

//     if (pagination.totalItems === 0) {
//         return (
//             <div className="border p-2 mt-2 text-center text-muted">
//                 Відгуків немає
//             </div>
//         );
//     }

//     return (
//         <div className="border p-2 mt-2">

//             {/* HEADER */}
//             <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
//                 <span className="fw-bold text-muted small">
//                     Всього відгуків: {pagination.totalItems}
//                 </span>

//                 {pagination.totalItems > 2 && (
//                     <button
//                         onClick={toggleView}
//                         className="btn btn-sm btn-link text-decoration-none p-0"
//                     >
//                         {isExpanded ? "Згорнути" : "Показати всі"}
//                         <i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"} ms-1`} />
//                     </button>
//                 )}
//             </div>

//             {/* PAGINATION */}
//             {!isExpanded && pagination.lastPage > 1 && (
//                 <nav className="d-flex justify-content-center">
//                     <ul className="pagination pagination-sm mb-2">

//                         <li className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}>
//                             <span className="page-link" role="button" onClick={prevPage}>
//                                 &laquo;
//                             </span>
//                         </li>

//                         {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(p => (
//                             <li key={p} className={`page-item ${p === pagination.currentPage ? "active" : ""}`}>
//                                 <span
//                                     className="page-link"
//                                     role="button"
//                                     onClick={(e) => goToPage(e, p)}
//                                 >
//                                     {p}
//                                 </span>
//                             </li>
//                         ))}

//                         <li className={`page-item ${pagination.currentPage === pagination.lastPage ? "disabled" : ""}`}>
//                             <span className="page-link" role="button" onClick={nextPage}>
//                                 &raquo;
//                             </span>
//                         </li>
//                     </ul>
//                 </nav>
//             )}

//             {/* REVIEWS */}
//             {rates.map(r => (
//                 <div key={r.id} className="border-top pt-2 mt-2 text-break">
//                     <div className="d-flex justify-content-between text-muted small">
//                         <span>{r.createdAt?.substring(0, 10)}</span>
//                         <a href={`mailto:${r.user.email}`} className="text-decoration-none">
//                             {r.user.name}
//                         </a>
//                     </div>

//                     <div className="mt-1">
//                         {r.text ? <i>{r.text}</i> : <span className="text-muted">— Без коментаря —</span>}
//                     </div>

//                     <div className="mt-1 small">
//                         Оцінка: {r.rateStars > 0
//                             ? <b>{r.rateStars}/5</b>
//                             : <span className="text-muted">—</span>}
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }
