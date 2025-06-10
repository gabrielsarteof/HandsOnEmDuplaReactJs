// src/components/Header.jsx
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import authService from '@services/authService';
import profileService from '@services/profileService';

const Header = ({ cartCount = 0 }) => {
  const { user, isAdmin } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/40?text=A');  

  // Buscar o perfil do usuário para obter o avatar
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          // Limpar o avatar ao trocar de usuário
          setAvatarUrl('https://placehold.co/40?text=A');
          
          const profile = await profileService.getProfile();
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
        }
      };
      fetchProfile();
    } else {
      // Resetar o avatar quando não houver usuário
      setAvatarUrl('https://placehold.co/40?text=A');
    }
  }, [user?.id]); // Dependência no ID do usuário para garantir atualização quando mudar

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <NavLink className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi-shop me-2 fs-3"></i>
            Loja Virtual
          </NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menuPrincipal">
            <div className="navbar-nav">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
              <NavLink className="nav-link" to="/products" end>
                Produtos
              </NavLink>
              <a className="nav-link" href="/about">Quem Somos</a>
              <a className="nav-link" href="/contact">Contato</a>
            </div>
            <div className="d-flex gap-3 ms-auto text-end align-items-center">
              <span className="navbar-text position-relative">
                <i className="bi-cart fs-3"></i>
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-50">{cartCount}</span>
              </span>
              {user ? (
                <div className="dropdown text-end d-flex align-items-center">
                  <a className="text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="rounded-circle me-2 border border-1 border-secondary border-opacity-75 p-1"
                      style={{ width: 32, height: 32, objectFit: 'cover' }}
                    />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {isAdmin && (
                      <>
                        <li><Link className="dropdown-item" to="/admin/users">Usuários</Link></li>
                        <li><Link className="dropdown-item" to="/admin/products">Produtos</Link></li>
                        <li><Link className="dropdown-item" to="/admin/categories">Categorias</Link></li>
                        <li><Link className="dropdown-item" to="/admin/carriers">Fornecedores</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    <li><Link className="dropdown-item" to="/user/profile">Perfil</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button onClick={() => authService.logout()} className="dropdown-item">Sair</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline-light ms-3">Entrar</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header;