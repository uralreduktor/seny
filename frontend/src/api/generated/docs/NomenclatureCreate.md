# NomenclatureCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**category** | **string** |  | [optional] [default to undefined]
**subclass** | **string** |  | [optional] [default to undefined]
**manufacturer** | **string** |  | [optional] [default to undefined]
**standard_document** | **string** |  | [optional] [default to undefined]
**article** | **string** |  | [optional] [default to undefined]
**standard_parameters** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**required_parameters** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**optional_parameters** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**base_price** | [**BasePrice**](BasePrice.md) |  | [optional] [default to undefined]
**cost_price** | [**CostPrice**](CostPrice.md) |  | [optional] [default to undefined]
**price_currency** | **string** |  | [optional] [default to 'RUB']
**price_source** | **string** |  | [optional] [default to undefined]
**synonyms** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**keywords** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**tags** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**is_active** | **boolean** |  | [optional] [default to true]

## Example

```typescript
import { NomenclatureCreate } from '@tenderflow/api-client';

const instance: NomenclatureCreate = {
    name,
    type,
    category,
    subclass,
    manufacturer,
    standard_document,
    article,
    standard_parameters,
    required_parameters,
    optional_parameters,
    base_price,
    cost_price,
    price_currency,
    price_source,
    synonyms,
    keywords,
    tags,
    is_active,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
