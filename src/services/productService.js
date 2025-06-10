import supabase from './supabase';

const BUCKET = 'product';

/** 
 * Converte uma key de bucket ou URL externa em URL navegável.
 */
function resolveImageUrl(keyOrUrl) {
  if (!keyOrUrl) return null;
  if (/^https?:\/\//.test(keyOrUrl)) {
    // já é URL externa
    return keyOrUrl;
  }
  // trata como key do bucket
  return supabase
    .storage
    .from(BUCKET)
    .getPublicUrl(keyOrUrl)
    .data
    .publicUrl;
}

const productService = {
  /**
   * Lista produtos paginados e resolve image_url para cada um.
   */
  async getProductsByPage(page = 1, limit = 12) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from('products')
      .select('*, category:category_id(name)', { count: 'exact' })
      .range(from, to)
      .order('title', { ascending: true });
    if (error) throw error;

    const products = data.map(p => ({
      ...p,
      image_url: resolveImageUrl(p.image_url)
    }));

    return {
      products,
      total: count,
      totalPages: Math.ceil(count / limit)
    };
  },

  /**
   * Busca um produto por ID e resolve sua image_url.
   */
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    return {
      ...data,
      image_url: resolveImageUrl(data.image_url)
    };
  },

  /**
   * Cria um produto.
   *
   * @param {{ image_file?: File, image_url?: string, title: string, ... }} obj
   *    - image_file: se existir, faz upload no bucket  
   *    - image_url: se for URL externa (ex: picsum), é usada diretamente  
   *    - os demais campos (`title`, `price`, etc) devem vir em productData
   */
  async createProduct({ image_file, image_url: manualUrl, ...productData }) {
    // Prioriza o arquivo, se houver, senão usa a URL manual
    let image_url = manualUrl || null;
    if (image_file) {
      image_url = await this.uploadImage(image_file);
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, image_url }])
      .select();
    if (error) throw error;

    const prod = data[0];
    return {
      ...prod,
      image_url: resolveImageUrl(prod.image_url)
    };
  },

  /**
   * Atualiza um produto existente.
   *
   * @param {number} id 
   * @param {{ image_file?: File, image_url?: string, title?: string, ... }} obj
   */
  async updateProduct(id, { image_file, image_url: manualUrl, ...productData }) {
    let image_url = manualUrl;
    if (image_file) {
      image_url = await this.uploadImage(image_file);
    }

    // só inclui image_url no update se veio definido (null ou string)
    const updateData = image_url !== undefined
      ? { ...productData, image_url }
      : productData;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select();
    if (error) throw error;

    const prod = data[0];
    return {
      ...prod,
      image_url: resolveImageUrl(prod.image_url)
    };
  },

  /**
   * Faz upload de qualquer tipo de arquivo no bucket e retorna a key gerada.
   */
  async uploadImage(file) {
    const ext = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase
      .storage
      .from(BUCKET)
      .upload(fileName, file);
    if (error) throw error;

    // supabase-js v2 retorna data.path; v1 retornava data.Key
    return data?.path ?? data?.Key ?? fileName;
  },

  /**
   * Deleta um produto pelo ID.
   */
  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

export default productService;
