import json

def filtrar_restaurantes(restaurantes, categoria, orcamento): 
    selecionados = []
    for restaurante in restaurantes:
        custo_estimado = restaurante["averagePrice"] + restaurante["deliveryFee"]
        
        if restaurante["category"] == categoria and custo_estimado <= orcamento:
            selecionados.append(restaurante)
             
    return selecionados

with open ("src/data/restaurants.json", encoding="utf-8") as file:
    restaurantes = json.load(file)
 
categoria = "Pizza"      
orcamento = 100

restaurantes_ordenados = filtrar_restaurantes(
    restaurantes,
    categoria,
    orcamento
)      

if len(restaurantes_ordenados) == 0:
    print("Não há restaurantes japoneses disponíveis dentro do orçamento.")
else:
    print("Quantidade encontrada:", len(restaurantes_ordenados))
    print("Restaurantes japoneses disponíveis dentro do orçamento:")
    
    for restaurante in restaurantes_ordenados:
        print(
            restaurante["name"],
            restaurante["rating"],
            sep=" | "
        )