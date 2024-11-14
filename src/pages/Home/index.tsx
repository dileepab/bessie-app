import {PageContainer} from '@ant-design/pro-components';
import styles from './index.less';
import {Form, Input, InputNumber, Card, Row, Col, Select} from 'antd';
import React, {useEffect, useState} from 'react';
import ProductSelector from "@/pages/Home/components/ProductSelector";
import ExcelJS from "exceljs";
import EnergyChart from "@/pages/Home/components/EnergyChart";
import PowerChart from "@/pages/Home/components/PowerChart";
import EfficiencyChart from "@/pages/Home/components/EfficiencyChart";

interface InputData {
  parameter: string;
  value: string;
  cell: string;
  options?: string[];
}

const HomePage: React.FC = () => {
  const [formData, setFormData] = useState<InputData[]>([]);
  const [workbook, setWorkbook] = useState<ExcelJS.Workbook | null>(null);
  const [requiredEnergy, setRequiredEnergy] = useState<number | null>(null);
  const [requiredPower, setRequiredPower] = useState<number | null>(null);


  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/fetch-data?range=Project Inputs!A2:N17`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      setWorkbook(responseData)
      setRequiredEnergy(parseFloat(responseData[0][1]) * parseFloat(responseData[1][1]));
      setRequiredPower(parseFloat(responseData[0][1]));
      const data = [
        {parameter: 'Required Power (MW)', value: responseData[0][1], cell: 'B2'},
        {parameter: 'Required Duration (h)', value: responseData[1][1], cell: 'B3'},
        {parameter: 'Power Factor', value: responseData[3][1], cell: 'B5'},
        {parameter: 'Cycles per year', value: responseData[4][1], cell: 'B6'},
        {
          parameter: 'AC- or DC-Coupled',
          value: responseData[5][1],
          options: ['AC', 'DC'],
          cell: 'B7'
        },
        {
          parameter: 'AC or DC Augmentation',
          value: responseData[6][1],
          options: ['AC', 'DC'],
          cell: 'B8'
        },
        {parameter: 'Project Lifetime (years)', value: responseData[7][1], cell: 'B9'},
      ];
      setFormData(data);
    } catch (error) {
      console.error('Error reading Excel file:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateWorkbookBuffer = async (cell: string, value: string) => {
    if (workbook) {
      try {
        const response = await fetch('http://localhost:8080/update-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // Your data to send
            cell: cell,
            value: value
          })
        });

        const responseData = await response.json();
        setWorkbook(responseData);
        setRequiredEnergy(parseFloat(responseData[0][1]) * parseFloat(responseData[1][1]));
        setRequiredPower(parseFloat(responseData[0][1]));
      } catch (error) {
        console.error('Error updating Excel file:', error);
      }
    }
  };

  const handleInputChange = async (index: number, value: string | number, cell: string) => {
    const updatedData = [...formData];
    updatedData[index].value = value.toString();
    setFormData(updatedData);

    await updateWorkbookBuffer(cell, value.toString());
  };

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Card title="Project Requirements" style={{marginTop: '20px'}}>
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              {formData.map((item, index) => (
                <Col
                  key={item.parameter}
                  xs={24} sm={12} md={12} lg={6} xl={6}
                >
                  <Form.Item label={item.parameter}>
                    {item.options ? (
                      <Select
                        value={item.value}
                        onChange={(value) => handleInputChange(index, value, item.cell)}
                        style={{width: '100%'}}
                      >
                        {item.options.map(option => (
                          <Select.Option key={option} value={option}>
                            {option}
                          </Select.Option>
                        ))}
                      </Select>
                    ) : index === 0 || index === 1 ? (
                      <InputNumber
                        value={parseFloat(item.value)}
                        onChange={(value) => handleInputChange(index, value || 0, item.cell)}
                        style={{width: '100%'}}
                      />
                    ) : (
                      <Input
                        value={item.value}
                        onChange={(e) => handleInputChange(index, e.target.value, item.cell)}
                      />
                    )}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </Card>
        {workbook && <ProductSelector workbook={workbook} />}

        {/* Charts Section */}
        <Card title="Outputted Plots" style={{ marginTop: '20px' }}>
          <Card title="Energy at POI (MWh) vs. Year" style={{ marginTop: '20px' }}>
            {requiredEnergy &&<EnergyChart requiredEnergy={requiredEnergy} />}
          </Card>
          <Card title="Power at POI (MW) vs. Year" style={{ marginTop: '20px' }}>
            {requiredPower && <PowerChart requiredPower={requiredPower} />}
          </Card>
          <Card title="Round-Trip Efficiency at POI (%) vs. Year" style={{ marginTop: '20px' }}>
            <EfficiencyChart />
          </Card>
        </Card>
      </div>
    </PageContainer>
  );
};

export default HomePage;
