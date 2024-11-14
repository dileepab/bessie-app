import React, {useState, useEffect} from 'react';
import {Select, Card, Typography, List, Row, Col} from 'antd';

const {Title, Text} = Typography;
const {Option} = Select;

interface ProductSelectorProps {
  workbook: any;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({workbook}) => {
  const [products, setProducts] = useState<{
    name: string;
    properties: (string | number | null | undefined)[];
    calculatedValues: (string | number | null | undefined)[];
  }[]>([]);
  const [propertyLabels, setPropertyLabels] = useState<(string | null)[]>([]);
  const [calculatedLabels, setCalculatedLabels] = useState<(string | null)[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadWorkbookData = async () => {
      if (!workbook) return;

      try {

        const productData: {
          name: string;
          properties: (string | number | null | undefined)[];
          calculatedValues: (string | number | null | undefined)[];
        }[] = [];
        const propertyLabels: (string | null)[] = [];
        const calculatedLabels: (string | null)[] = [];

        // Extract property labels
        for (let row = 1; row <= 8; row++) {
          const labelCell = workbook[row][3];
          propertyLabels.push(labelCell);
        }

        // Extract calculated labels
        for (let row = 11; row <= 15; row++) {
          const labelCell = workbook[row][3];
          calculatedLabels.push(labelCell);
        }

        // Extract products data
        for (let col = 4; col <= 13; col++) {
          const columnData: (string | number | undefined | null)[] = [];
          const calculatedValues: (string | number | null | undefined)[] = [];

          workbook.forEach((row: [], index: number) => {
            if (index >= 0 && index <= 8) {
              const cellValue = row[col];
              columnData.push(cellValue);
            }
          });

          workbook.forEach((row: [], index: number) => {
            if (index >= 11 && index <= 15) {
              const cellValue = row[col];
              calculatedValues.push(cellValue);
            }
          });

          // for (let row = 13; row <= 17; row++) {
          //   const cell = worksheet.getCell(row, col);
          //   const calcValue = cell.value;
          //   const isCurrency = cell.numFmt ? cell.numFmt.includes('$') || cell.numFmt.includes('¤') : false;
          //
          //   if (typeof calcValue === 'object' && calcValue !== null && 'result' in calcValue) {
          //     calculatedValues.push({value: calcValue.result as string | number | null | undefined, isCurrency});
          //   } else {
          //     calculatedValues.push({value: calcValue as string | number | null | undefined, isCurrency});
          //   }
          // }

          const productName = columnData[0] as string;
          const properties = columnData.slice(1);

          productData.push({name: productName, properties, calculatedValues});
        }

        setProducts(productData);
        setPropertyLabels(propertyLabels);
        setCalculatedLabels(calculatedLabels);
      } catch (error) {
        console.error('Error reading Excel file from buffer:', error);
      }
    };

    loadWorkbookData().then();
  }, [workbook]); // Depend on workbookBuffer to reload when buffer changes


  const handleProductChange = (value: number) => {
    setSelectedProductIndex(value);
  };

  useEffect(() => {
    if (selectedProductIndex)
      handleProductChange(selectedProductIndex)
  }, [products]);

  return (
    <Card title="Product Selector">
      <Title level={4}>Select a Product</Title>
      <Select style={{width: '100%'}} onChange={handleProductChange} placeholder="Select a product">
        {products.map((product, index) => (
          <Option key={index} value={index}>
            {product.name}
          </Option>
        ))}
      </Select>

      {selectedProductIndex !== null && (
        <Row gutter={[16, 16]}>
          <Col
            xs={24} sm={24} md={12} lg={12} xl={12}>
            <Title level={5} style={{marginTop: '20px'}}>Properties for Selected Product</Title>
            <List
              bordered
              dataSource={products[selectedProductIndex].properties}
              renderItem={(property, i) => (
                <List.Item>
                  <Text strong>{propertyLabels[i] ?? 'N/A'}:</Text> <Text>{property ?? 'N/A'}</Text>
                </List.Item>
              )}
            />
          </Col>

          <Col
            xs={24} sm={24} md={12} lg={12} xl={12}>
            <Title level={5} style={{marginTop: '20px'}}>Calculated Values</Title>
            <List
              bordered
              dataSource={calculatedLabels}
              renderItem={(label, i) => (
                <List.Item>
                  <Text strong>{label}:</Text>{' '}
                  <Text>
                    {products[selectedProductIndex]?.calculatedValues[i] || 'N/A'}
                  </Text>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default ProductSelector;
