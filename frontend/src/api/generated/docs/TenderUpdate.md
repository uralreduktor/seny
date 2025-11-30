# TenderUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [optional] [default to undefined]
**customer** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**source_url** | **string** |  | [optional] [default to undefined]
**deadline_at** | **string** |  | [optional] [default to undefined]
**initial_max_price** | [**InitialMaxPrice**](InitialMaxPrice.md) |  | [optional] [default to undefined]
**terms** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**responsible_id** | **number** |  | [optional] [default to undefined]
**engineer_id** | **number** |  | [optional] [default to undefined]
**is_archived** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { TenderUpdate } from '@tenderflow/api-client';

const instance: TenderUpdate = {
    title,
    customer,
    description,
    source_url,
    deadline_at,
    initial_max_price,
    terms,
    responsible_id,
    engineer_id,
    is_archived,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
