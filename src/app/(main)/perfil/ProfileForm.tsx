"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import { updateProfileInfo, updatePassword } from "@/app/actions/profile";
import { signOut } from "next-auth/react";

export default function ProfileForm({ initialData }: { initialData: any }) {
  const [name, setName] = useState(initialData.name || "");
  const [image, setImage] = useState(initialData.image || ""); // Salva Base64 ou URL
  
  // Estados para o Cropper
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Imagem pura selecionada
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lê o arquivo do input e carrega para o Cropper
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropping(true);
      e.target.value = ''; // Reseta o input
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
        setImage(croppedImageBase64); // Define como a foto final a ser salva
        setIsCropping(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao cortar a imagem.");
    }
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setImageSrc(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileMessage("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);
      await updateProfileInfo(formData);
      setProfileMessage("✅ Perfil atualizado com sucesso!");
    } catch (error: any) {
      setProfileMessage("❌ Erro ao atualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordMessage("");
    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      await updatePassword(formData);
      setPasswordMessage("✅ Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      setPasswordMessage(`❌ ${error.message || "Erro ao alterar a senha."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Formulário de Informações Básicas */}
        <section className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
            Dados Pessoais
          </h2>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', 
                background: 'rgba(255,255,255,0.1)', flexShrink: 0, position: 'relative'
              }}>
                {image ? (
                  <Image src={image} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    👤
                  </div>
                )}
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Foto de Perfil</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={onFileChange}
                  id="avatarUpload"
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor="avatarUpload" 
                  className="btn-secondary" 
                  style={{ display: 'inline-block', width: 'fit-content', textAlign: 'center', cursor: 'pointer' }}
                >
                  📸 Escolher Foto
                </label>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
                  A foto será cortada num formato perfeitamente circular.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>E-mail (Apenas leitura)</label>
              <input 
                type="text" 
                value={initialData.email} 
                disabled
                style={{ 
                  width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(0,0,0,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Nome Completo</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                required
                style={{ 
                  width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                  background: 'var(--input-bg)', color: 'white', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ color: profileMessage.includes('✅') ? '#4ade80' : '#f87171' }}>
                {profileMessage}
              </span>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                Salvar Dados
              </button>
            </div>
          </form>
        </section>

        {/* Formulário de Troca de Senha */}
        <section className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
            Segurança
          </h2>
          
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Senha Atual</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)}
                required
                placeholder="Digite sua senha atual"
                style={{ 
                  width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                  background: 'var(--input-bg)', color: 'white', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Nova Senha</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Digite a nova senha (mín. 6 caracteres)"
                style={{ 
                  width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                  background: 'var(--input-bg)', color: 'white', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ color: passwordMessage.includes('✅') ? '#4ade80' : '#f87171' }}>
                {passwordMessage}
              </span>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                Alterar Senha
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Seção de Logout (Essencial para Mobile) */}
      <section className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgba(255,255,255,0.7)' }}>
          Encerrar Sessão
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
          Deseja sair da sua conta neste dispositivo?
        </p>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ 
            marginTop: '1rem', background: 'rgba(222, 57, 64, 0.2)', color: '#ff6b6b',
            border: '1px solid rgba(222, 57, 64, 0.4)', padding: '0.75rem 2rem', borderRadius: '8px',
            fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease'
          }}
        >
          Sair da Conta
        </button>
      </section>

      {/* Modal de Crop (Fica Sobreposto ao layout quando a foto é escolhida) */}
      {isCropping && imageSrc && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // Proporção quadrada (1:1) para avatar
              cropShape="round" // Mostra máscara redonda
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ 
            padding: '2rem', background: 'var(--bg-color)', display: 'flex', 
            justifyContent: 'center', gap: '1rem', alignItems: 'center',
            borderTop: '1px solid var(--glass-border)'
          }}>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>Zoom:</span>
            <input 
              type="range" 
              min={1} max={3} step={0.1} 
              value={zoom} onChange={(e) => setZoom(Number(e.target.value))} 
              style={{ width: '200px' }}
            />
            <button className="btn-secondary" onClick={cancelCrop} style={{ marginLeft: '2rem' }}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleCropImage}>
              Cortar e Aplicar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
