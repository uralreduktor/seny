# TenderCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**number** | **string** |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**customer** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**source** | [**TenderSource**](TenderSource.md) |  | [optional] [default to undefined]
**source_url** | **string** |  | [optional] [default to undefined]
**deadline_at** | **string** |  | [default to undefined]
**published_at** | **string** |  | [optional] [default to undefined]
**initial_max_price** | [**InitialMaxPrice**](InitialMaxPrice.md) |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to 'RUB']
**terms** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**responsible_id** | **number** |  | [optional] [default to undefined]
**engineer_id** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { TenderCreate } from '@tenderflow/api-client';

const instance: TenderCreate = {
    number,
    title,
    customer,
    description,
    source,
    source_url,
    deadline_at,
    published_at,
    initial_max_price,
    currency,
    terms,
    responsible_id,
    engineer_id,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
