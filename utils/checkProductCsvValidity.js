exports.checkProductCsvValidity = async (data)=>{
    const itemTypes = ['buy', 'sell', 'both'];
    for(let i=0; i<data.length; i++){
        const product = data[i];
        if(!product.inventory_category){
            throw new Error(`Inventory category is a required field in row: ${i+1}`);
        }
        if(product.inventory_category !== 'direct' && product.inventory_category !== 'indirect'){
            throw new Error(`Inventory category must be one of: direct, indirect in row: ${i+1}`);
        }
        if(!product.name){
            throw new Error(`Product name is a required field in row: ${i+1}`);
        }
        if(!product.product_id){
            throw new Error(`Product id is a required field in row: ${i+1}`);
        }
        if(!product.uom){
            throw new Error(`Unit of measurement (UOM) is a required field in row: ${i+1}`);
        }
        if(!product.current_stock || product.current_stock.trim() === '' ){
            throw new Error(`Current stock is a required field in row: ${i+1}`);
        }
        if(isNaN(+product.current_stock)){
            throw new Error(`Current stock must be a number in row: ${i+1}`);
        }
        if(product.min_stock && product.min_stock.trim() !== '' && isNaN(+product.min_stock)){
            throw new Error(`Min stock must be a number in row: ${i+1}`);
        }
        if(product.max_stock && product.max_stock.trim() !== '' && isNaN(+product.max_stock)){
            throw new Error(`Max stock must be a number in row: ${i+1}`);
        }
        if(!product.price || product.price.trim() === ''){
            throw new Error(`Price is a required field in row: ${i+1}`);
        }
        if(isNaN(+product.price)){
            throw new Error(`Price must be a number in row: ${i+1}`);
        }
        if(!product.item_type && itemTypes.includes(product.item_type)){
            throw new Error(`Item type is a required field in row: ${i+1} Valid values: both, buy, sell`);
        }
        if(!product.product_or_service && (product.product_or_service === 'product' || product.product_or_service === 'service')){
            throw new Error(`Product/Service is a required field in row: ${i+1} Valid values: product, service`);
        }
    }
}